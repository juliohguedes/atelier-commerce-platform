import { AccountDeletionRequestForm } from "@/components/client-area/account-deletion-request-form";
import {
 ClientProfileForm,
 type ClientProfileInitialData
} from "@/components/forms/client-profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatCep, formatCpf, formatPhoneBR } from "@/lib/validations/br";
import { getClientDashboardData } from "@/services/client-area/get-client-dashboard-data";
import type { AddressInput } from "@/lib/validations/auth";

interface ProfileRow {
 full_name: string | null;
 email: string | null;
 whatsapp: string | null;
 cpf: string | null;
}

interface AddressRow {
 id: string;
 label: string;
 recipient_name: string;
 zip_code: string;
 street: string;
 number: string;
 complement: string | null;
 neighborhood: string;
 city: string;
 state: string;
 is_primary: boolean;
}

function createDefaultAddress(): AddressInput {
 return {
 id: undefined,
 label: "Principal",
 recipientName: "",
 zipCode: "",
 street: "",
 number: "",
 complement: "",
 neighborhood: "",
 city: "",
 state: ""
 };
}

function toAddressInput(address: AddressRow): AddressInput {
 return {
 id: address.id,
 label: address.label,
 recipientName: address.recipient_name,
 zipCode: formatCep(address.zip_code),
 street: address.street,
 number: address.number,
 complement: address.complement ?? "",
 neighborhood: address.neighborhood,
 city: address.city,
 state: address.state
 };
}

export default async function ClientAccountPage() {
 const { userId, userEmail } = await requireRole(["client", "admin"]);
 const dashboardData = await getClientDashboardData(userId);

 let profile: ProfileRow | null = null;
 let addresses: AddressRow[] = [];

 if (isSupabaseConfigured) {
 const supabase = await createSupabaseServerClient();
 const [profileResponse, addressesResponse] = await Promise.all([
 supabase
 .from("profiles")
 .select("full_name,email,whatsapp,cpf")
 .eq("id", userId)
 .maybeSingle<ProfileRow>(),
 supabase
 .from("addresses")
 .select(
 "id,label,recipient_name,zip_code,street,number,complement,neighborhood,city,state,is_primary"
 )
 .eq("user_id", userId)
 .order("is_primary", { ascending: false })
 .order("created_at", { ascending: true })
 .returns<AddressRow[]>()
 ]);

 profile = profileResponse.data;
 addresses = addressesResponse.data ?? [];
 }

 const sortedAddresses = [...addresses].sort((firstAddress, secondAddress) => {
 if (firstAddress.is_primary === secondAddress.is_primary) {
 return 0;
 }

 return firstAddress.is_primary ? -1 : 1;
 });

 const primaryAddress = sortedAddresses[0] ?? null;
 const additionalAddresses = sortedAddresses.slice(1);

 const initialData: ClientProfileInitialData = {
 fullName: profile?.full_name ?? "",
 email: profile?.email ?? userEmail ?? "",
 whatsapp: profile?.whatsapp ? formatPhoneBR(profile.whatsapp) : "",
 cpf: profile?.cpf ? formatCpf(profile.cpf) : "",
 mainAddress: primaryAddress ? toAddressInput(primaryAddress) : createDefaultAddress(),
 additionalAddresses: additionalAddresses.map(toAddressInput)
 };

 return (
 <div className="space-y-6">
 <header className="space-y-2">
 <p className="text-sm uppercase tracking-[0.24em] text-gold-400">Área da cliente</p>
 <h1 className="text-4xl">Minha conta</h1>
 <p className="text-muted-foreground">
 Edite seus dados, gerencie endereços, acompanhe solicitações e configure a conta.
 </p>
 </header>

 <Card>
 <CardHeader>
 <CardTitle>Dados pessoais e endereços</CardTitle>
 <CardDescription>
 Você pode editar seus próprios dados e organizar os endereços de entrega da loja.
 </CardDescription>
 </CardHeader>
 <CardContent>
 <ClientProfileForm initialData={initialData} />
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle>Solicitar exclusão da conta</CardTitle>
 <CardDescription>
 A solicitação passa por análise interna antes da conclusão e você recebe retorno pela
 plataforma/e-mail.
 </CardDescription>
 </CardHeader>
 <CardContent>
 <AccountDeletionRequestForm latestRequest={dashboardData.latestDeletionRequest} />
 </CardContent>
 </Card>
 </div>
 );
}
