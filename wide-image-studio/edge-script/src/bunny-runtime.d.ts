// Declarações de tipos para o runtime Bunny Edge Scripting.
// O runtime usa o padrão fetch event do Service Worker, mas não está incluído
// no lib "DOM" padrão do TypeScript — declaramos o mínimo necessário aqui.

declare class FetchEvent extends Event {
  readonly request: Request;
  respondWith(response: Response | Promise<Response>): void;
}

declare function addEventListener(
  type: "fetch",
  listener: (event: FetchEvent) => void,
): void;
