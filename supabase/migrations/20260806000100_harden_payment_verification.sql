-- Align the database status with the app's PaymentProofStatus enum.
ALTER TABLE public.payment_proofs
  DROP CONSTRAINT payment_proofs_status_check;

ALTER TABLE public.payment_proofs
  ADD CONSTRAINT payment_proofs_status_check
  CHECK (status IN ('submitted', 'verified', 'rejected'));

ALTER TABLE public.payment_proofs
  DROP CONSTRAINT IF EXISTS payment_proofs_rejection_reason_check;

ALTER TABLE public.payment_proofs
  ADD CONSTRAINT payment_proofs_rejection_reason_check
  CHECK (
    (
      status = 'rejected'
      AND rejection_reason IS NOT NULL
      AND length(trim(rejection_reason)) BETWEEN 1 AND 200
    )
    OR (
      status <> 'rejected'
      AND rejection_reason IS NULL
    )
  );

-- Replace broad client-side table permissions.
DROP POLICY IF EXISTS "Staff can delete payment proofs" ON public.payment_proofs;
DROP POLICY IF EXISTS "Staff can update payment proofs" ON public.payment_proofs;
DROP POLICY IF EXISTS "Staff can view all payment proofs" ON public.payment_proofs;
DROP POLICY IF EXISTS "Users can update their payment proofs" ON public.payment_proofs;
DROP POLICY IF EXISTS "Users can upload payment proofs" ON public.payment_proofs;
DROP POLICY IF EXISTS "Users can view their own payment proofs" ON public.payment_proofs;

-- Customers can view only their own proof. Staff can view proofs for review.
CREATE POLICY "payment_proofs_select_owner_or_staff"
  ON public.payment_proofs
  FOR SELECT
  TO authenticated
  USING (uploaded_by = auth.uid() OR is_staff());

-- A customer may submit a proof only for their own order.
CREATE POLICY "payment_proofs_insert_owner"
  ON public.payment_proofs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.orders
      WHERE orders.id = payment_proofs.order_id
        AND orders.customer_id = auth.uid()
    )
  );

-- A customer may replace a submitted/rejected proof, but cannot self-verify,
-- self-reject, or alter another customer's order.
CREATE POLICY "payment_proofs_update_owner_before_review"
  ON public.payment_proofs
  FOR UPDATE
  TO authenticated
  USING (
    uploaded_by = auth.uid()
    AND status IN ('submitted', 'rejected')
  )
  WITH CHECK (
    uploaded_by = auth.uid()
    AND status = 'submitted'
    AND verified_by IS NULL
    AND verified_at IS NULL
    AND rejection_reason IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.orders
      WHERE orders.id = payment_proofs.order_id
        AND orders.customer_id = auth.uid()
    )
  );

-- Replace storage policies: customers must not be able to view every receipt.
DROP POLICY IF EXISTS "Staff delete payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Staff manage payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can update payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view payment proofs" ON storage.objects;

CREATE POLICY "payment_proofs_storage_select_owner_or_staff"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'payment-proofs'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR is_staff()
    )
  );

CREATE POLICY "payment_proofs_storage_insert_owner"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'payment-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND EXISTS (
      SELECT 1
      FROM public.orders
      WHERE orders.id::text = (storage.foldername(name))[2]
        AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "payment_proofs_storage_update_owner"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'payment-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'payment-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "payment_proofs_storage_delete_owner"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'payment-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "payment_proofs_storage_manage_staff"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'payment-proofs' AND is_staff())
  WITH CHECK (bucket_id = 'payment-proofs' AND is_staff());

-- Verify payment and advance the order in one database transaction.
CREATE OR REPLACE FUNCTION public.verify_payment_proof(p_proof_id uuid)
RETURNS public.payment_proofs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_proof public.payment_proofs;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can verify payment proofs';
  END IF;

  UPDATE public.payment_proofs
  SET
    status = 'verified',
    verified_by = auth.uid(),
    verified_at = now(),
    rejection_reason = NULL,
    updated_at = now()
  WHERE id = p_proof_id
    AND status = 'submitted'
  RETURNING * INTO v_proof;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment proof is not available for verification';
  END IF;

  UPDATE public.orders
  SET
    payment_status = 'paid',
    order_status = 'processing',
    updated_at = now()
  WHERE id = v_proof.order_id;

  RETURN v_proof;
END;
$$;

-- Reject payment, preserve the reason, and return the order to payment pending.
CREATE OR REPLACE FUNCTION public.reject_payment_proof(
  p_proof_id uuid,
  p_reason text
)
RETURNS public.payment_proofs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_proof public.payment_proofs;
  v_reason text := trim(p_reason);
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can reject payment proofs';
  END IF;

  IF v_reason IS NULL OR length(v_reason) NOT BETWEEN 1 AND 200 THEN
    RAISE EXCEPTION 'A rejection reason between 1 and 200 characters is required';
  END IF;

  UPDATE public.payment_proofs
  SET
    status = 'rejected',
    rejection_reason = v_reason,
    verified_by = auth.uid(),
    verified_at = now(),
    updated_at = now()
  WHERE id = p_proof_id
    AND status = 'submitted'
  RETURNING * INTO v_proof;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment proof is not available for rejection';
  END IF;

  UPDATE public.orders
  SET
    payment_status = 'pending',
    order_status = 'pending',
    updated_at = now()
  WHERE id = v_proof.order_id;

  RETURN v_proof;
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_payment_proof(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_payment_proof(uuid, text) TO authenticated;