import { FilaPermiso } from "@/components/FilaPermiso";
import { Pantalla } from "@/components/Pantalla";
import { Texto } from "@/components/Texto";
import { RECURSOS } from "@/lib/permisos";

export default function Permisos() {
  return (
    <Pantalla titulo="Permisos">
      <Texto suave>
        Estado de cada permiso. Se actualiza solo al volver de Ajustes.
      </Texto>
      {RECURSOS.map((recurso) => (
        <FilaPermiso key={recurso} recurso={recurso} />
      ))}
    </Pantalla>
  );
}
