-- Admin fulfillment workflow. Apply only after the existing migration-history
-- mismatch has been reconciled; this migration is intentionally not pushed here.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS processing_at timestamptz,
  ADD COLUMN IF NOT EXISTS shipped_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz;

CREATE OR REPLACE FUNCTION public.advance_order_fulfillment(
  p_order_id uuid,
  p_next_status text,
  p_tracking_number text DEFAULT NULL
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders;
  v_tracking_number text := nullif(trim(p_tracking_number), '');
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can advance order fulfillment';
  END IF;

  SELECT *
  INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF p_next_status = 'processing' THEN
    IF v_order.order_status <> 'confirmed' OR v_order.payment_status <> 'paid' THEN
      RAISE EXCEPTION 'Only paid confirmed orders can begin processing';
    END IF;

    UPDATE public.orders
    SET order_status = 'processing', processing_at = coalesce(processing_at, now()), updated_at = now()
    WHERE id = p_order_id
    RETURNING * INTO v_order;
  ELSIF p_next_status = 'shipped' THEN
    IF v_order.order_status <> 'processing' THEN
      RAISE EXCEPTION 'Only processing orders can be shipped';
    END IF;

    IF v_tracking_number IS NULL THEN
      RAISE EXCEPTION 'A tracking number is required before shipping';
    END IF;

    UPDATE public.orders
    SET
      order_status = 'shipped',
      tracking_number = v_tracking_number,
      shipped_at = coalesce(shipped_at, now()),
      updated_at = now()
    WHERE id = p_order_id
    RETURNING * INTO v_order;
  ELSIF p_next_status = 'delivered' THEN
    IF v_order.order_status <> 'shipped' THEN
      RAISE EXCEPTION 'Only shipped orders can be marked delivered';
    END IF;

    UPDATE public.orders
    SET order_status = 'delivered', delivered_at = coalesce(delivered_at, now()), updated_at = now()
    WHERE id = p_order_id
    RETURNING * INTO v_order;
  ELSE
    RAISE EXCEPTION 'Unsupported fulfillment status';
  END IF;

  RETURN v_order;
END;
$$;

GRANT EXECUTE ON FUNCTION public.advance_order_fulfillment(uuid, text, text) TO authenticated;

-- Payment verification is the usual entry point into fulfillment, so preserve
-- its existing atomic behavior while recording when preparation began.
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
    processing_at = coalesce(processing_at, now()),
    updated_at = now()
  WHERE id = v_proof.order_id;

  RETURN v_proof;
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_payment_proof(uuid) TO authenticated;
