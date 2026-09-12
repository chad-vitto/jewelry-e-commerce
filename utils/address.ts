import { ShippingAddressDisplay } from "@/components/orders/ShippingAddressCard";
import { ShippingAddressForm } from "@/types";


export function toShippingAddressDisplay(
  address: ShippingAddressForm,
): ShippingAddressDisplay {
  return {
    full_name: address.full_name,
    phone_number: address.phone_number,
    address_line1: address.address_line1,
    address_line2: address.address_line2 || null,
    city: address.city,
    province: address.province,
    postal_code: address.postal_code,
  };
}