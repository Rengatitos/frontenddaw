Context Builder helpers

This file documents assumptions for endpoints used by `contextBuilderService.js`.

- `GET /usuarios/{id}` -> returns user object (or { data: user })
- `GET /roles/{id}` -> returns role object
- `GET /actividades/usuario/{usuarioRef}` -> returns list of actividades
- `GET /recursos` -> returns list of recursos
- `GET /catalogo_onboarding` or `GET /catalogoOnboarding` -> returns onboarding catalog
- `GET /salas/{usuarioRef}` -> returns sala object
- `GET /InteraccionChat/reducido/{usuarioRef}` -> returns historial reducido

If backend uses different endpoints or response shapes, adjust the services accordingly.
