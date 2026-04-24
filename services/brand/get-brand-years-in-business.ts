import { defaultYearsInBusiness } from "@/lib/constants/homepage";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const minAllowedYears = 0;
const maxAllowedYears = 200;

function isValidYears(value: unknown): value is number {
 return (
 typeof value === "number" &&
 Number.isInteger(value) &&
 value >= minAllowedYears &&
 value <= maxAllowedYears
 );
}

export async function getBrandYearsInBusiness(): Promise<number> {
 if (!isSupabaseConfigured) {
 return defaultYearsInBusiness;
 }

 try {
 const supabase = await createSupabaseServerClient();
 const { data, error } = await supabase
 .from("brand_settings")
 .select("years_in_business")
 .eq("singleton_key", true)
 .maybeSingle();

 if (error) {
 return defaultYearsInBusiness;
 }

 return isValidYears(data?.years_in_business)
 ? data.years_in_business
 : defaultYearsInBusiness;
 } catch {
 return defaultYearsInBusiness;
 }
}
