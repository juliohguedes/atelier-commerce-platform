import  Link  from  "next/link";
import  {  LogOut  }  from  "lucide-react";
import  {  signOutAction  }  from  "@/actions/auth/sign-out-action";
import  {  Button,  buttonVariants  }  from  "@/components/ui/button";
import  {  Container  }  from  "@/components/ui/container";
import  {  privateNavigationByRole  }  from  "@/lib/constants/navigation";
import  {  ROUTES  }  from  "@/lib/constants/routes";
import  {  cn  }  from  "@/lib/utils";
import  {  userRoleLabels,  type  UserRole  }  from  "@/types/auth";

interface  PrivateShellProps  {
    role:  UserRole;
    children:  React.ReactNode;
}

export  function  PrivateShell({  role,  children  }:  PrivateShellProps)  {
    const  navigation  =  privateNavigationByRole[role];

    return  (
        <div  className="min-h-screen  bg-background">
            <header  className="border-b  border-border/70  bg-card/80">
                <Container  className="flex  min-h-16  items-center  justify-between  gap-4">
                    <Link  className="font-serif  text-2xl  tracking-wide  text-gold-400"  href={ROUTES.private.dashboard}>
                        Painel  Interno
                    </Link>

                    <div  className="flex  items-center  gap-2">
                        <span  className="rounded-full  border  border-gold-500/40  bg-gold-500/10  px-3  py-1  text-xs  font-semibold  uppercase  tracking-wide  text-gold-400">
                            {userRoleLabels[role]}
                        </span>
                        <form  action={signOutAction}>
                            <Button  size="sm"  type="submit"  variant="outline">
                                <LogOut  className="mr-2  h-4  w-4"  />
                                Sair
                            </Button>
                        </form>
                    </div>
                </Container>
            </header>

            <Container  className="grid  gap-8  py-8  lg:grid-cols-[260px_1fr]">
                <aside  className="space-y-2  rounded-xl  border  border-border/70  bg-card/80  p-4">
                    <p  className="mb-2  text-xs  font-semibold  uppercase  tracking-[0.22em]  text-muted-foreground">
                        Navegação
                    </p>
                    {navigation.map((item)  =>  (
                        <Link
                            className={cn(
                                buttonVariants({  variant:  "ghost"  }),
                                "w-full  justify-start  text-left  text-sm"
                            )}
                            href={item.href}
                            key={item.href}
                        >
                            {item.label}
                        </Link>
                    ))}
                </aside>

                <section  className="rounded-xl  border  border-border/70  bg-card/80  p-6">{children}</section>
            </Container>
        </div>
    );
}
