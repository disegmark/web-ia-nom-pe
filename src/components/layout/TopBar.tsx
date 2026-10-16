import { Container } from "@/components/ui/Container";
import { SocialLinks } from "@/components/ui/SocialLinks";

/** Franja superior de la página, no sticky — desaparece al hacer scroll junto con el resto del contenido. */
export function TopBar() {
  return (
    <div className="border-b border-border bg-background">
      <Container className="flex items-center justify-end py-2">
        <SocialLinks />
      </Container>
    </div>
  );
}
