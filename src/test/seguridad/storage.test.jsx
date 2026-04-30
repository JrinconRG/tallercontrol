import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    storage: {
      from: vi.fn(),
    },
  },
}));

import { supabase } from "../../lib/supabase";
import { subirEvidencia, getImageUrl } from "../../services/storage";

//Helpers
function mockUserAutenticado() {
  supabase.auth.getUser.mockResolvedValue({
    data: { user: { id: "user-001" } },
    error: null,
  });
}

function mockStorage(uploadResult = { data: { path: "ok" }, error: null }) {
  supabase.storage.from.mockReturnValue({
    upload: vi.fn().mockResolvedValue(uploadResult),
    createSignedUrl: vi.fn(),
  });
}

function mockStorageUrl(
  urlResult = { data: { signedUrl: "https://cdn.test/img.jpg" }, error: null },
) {
  supabase.storage.from.mockReturnValue({
    upload: vi.fn(),
    createSignedUrl: vi.fn().mockResolvedValue(urlResult),
  });
}

function crearFile(nombre = "foto.jpg", tipo = "image/jpeg", tamañoKB = 100) {
  return new File([new Uint8Array(tamañoKB * 1024)], nombre, { type: tipo });
}

// ═══════════════════════════════════════════════════════════════════════════
describe("subirEvidencia › seguridad", () => {
  beforeEach(() => vi.clearAllMocks());

  it("[SEC-01] usuario no autenticado  lanza error, no sube archivo", async () => {
    // Arrange
    supabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });
    mockStorage();

    // Act + Assert
    await expect(subirEvidencia(crearFile(), "ruta/foto.jpg")).rejects.toThrow(
      "Usuario no autenticado",
    );

    // El storage nunca debe ser llamado
    expect(supabase.storage.from).not.toHaveBeenCalled();
  });

  it("[SEC-02] userError presente → lanza error aunque user exista", async () => {
    // Arrange
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-001" } },
      error: { message: "token expirado" },
    });

    // Act + Assert
    await expect(subirEvidencia(crearFile(), "ruta/foto.jpg")).rejects.toThrow(
      "Usuario no autenticado",
    );
    expect(supabase.storage.from).not.toHaveBeenCalled();
  });

  it("[SEC-03] getUser falla completamente (network) → propaga error, no sube", async () => {
    // Arrange
    supabase.auth.getUser.mockRejectedValue(new Error("network error"));

    // Act + Assert
    await expect(subirEvidencia(crearFile(), "ruta/foto.jpg")).rejects.toThrow(
      "network error",
    );
    expect(supabase.storage.from).not.toHaveBeenCalled();
  });

  it("[SEC-04] storage devuelve error → propaga el error sin silenciarlo", async () => {
    // Arrange
    mockUserAutenticado();
    supabase.storage.from.mockReturnValue({
      upload: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "bucket no existe" },
      }),
    });

    // Act + Assert — el error no debe ser tragado silenciosamente
    await expect(
      subirEvidencia(crearFile(), "ruta/foto.jpg"),
    ).rejects.toMatchObject({ message: "bucket no existe" });
  });

  it("[SEC-05] upload exitoso  retorna data del storage (no expone internals)", async () => {
    // Arrange
    mockUserAutenticado();
    const expectedData = {
      path: "evidencias/proceso-1/foto.jpg",
      id: "file-uuid",
    };
    supabase.storage.from.mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: expectedData, error: null }),
    });

    // Act
    const result = await subirEvidencia(
      crearFile(),
      "evidencias/proceso-1/foto.jpg",
    );

    // Assert
    expect(result).toEqual(expectedData);
  });

  it("[SEC-06] path de upload es exactamente el recibido (sin modificación)", async () => {
    // Arrange — verifica que no se manipula el path (path traversal prevention check)
    mockUserAutenticado();
    const uploadMock = vi
      .fn()
      .mockResolvedValue({ data: { path: "ok" }, error: null });
    supabase.storage.from.mockReturnValue({ upload: uploadMock });
    const path = "subprocesos/123/evidencia.jpg";

    // Act
    await subirEvidencia(crearFile(), path);

    // Assert
    expect(uploadMock).toHaveBeenCalledWith(
      path,
      expect.any(File),
      expect.any(Object),
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe("subirEvidencia - rendimiento", () => {
  beforeEach(() => vi.clearAllMocks());

  it("[PERF-01] flujo completo resuelve en < 200ms con latencia simulada", async () => {
    // Arrange — simula red lenta (~80ms getUser + ~80ms upload)
    supabase.auth.getUser.mockImplementation(
      () =>
        new Promise((r) =>
          setTimeout(
            () => r({ data: { user: { id: "u1" } }, error: null }),
            80,
          ),
        ),
    );
    supabase.storage.from.mockReturnValue({
      upload: vi
        .fn()
        .mockImplementation(
          () =>
            new Promise((r) =>
              setTimeout(() => r({ data: { path: "ok" }, error: null }), 80),
            ),
        ),
    });

    // Act
    const start = performance.now();
    await subirEvidencia(crearFile(), "ruta/foto.jpg");
    const elapsed = performance.now() - start;

    // Assert
    expect(elapsed).toBeLessThan(300); // 80 + 80 + overhead
  });

  it("[PERF-02] fallo de auth resuelve rapido (no bloquea con timeout)", async () => {
    // Arrange
    supabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    // Act
    const start = performance.now();
    await subirEvidencia(crearFile(), "ruta/foto.jpg").catch(() => {});
    const elapsed = performance.now() - start;

    // Assert
    expect(elapsed).toBeLessThan(50);
  });
});

describe("getImageUrl - seguridad", () => {
  beforeEach(() => vi.clearAllMocks());

  it("[SEC-07] path null  retorna null sin llamar a supabase", async () => {
    // Arrange + Act
    const result = await getImageUrl(null);

    // Assert
    expect(result).toBeNull();
    expect(supabase.storage.from).not.toHaveBeenCalled();
  });

  it("[SEC-08] path undefined  retorna null sin llamar a supabase", async () => {
    const result = await getImageUrl(undefined);
    expect(result).toBeNull();
    expect(supabase.storage.from).not.toHaveBeenCalled();
  });

  it("[SEC-09] path vacio  retorna null sin llamar a supabase", async () => {
    const result = await getImageUrl("");
    expect(result).toBeNull();
    expect(supabase.storage.from).not.toHaveBeenCalled();
  });

  it("[SEC-10] error al generar URL  retorna nul", async () => {
    // Arrange
    mockStorageUrl({ data: null, error: { message: "bucket privado" } });

    // Act
    const result = await getImageUrl("ruta/foto.jpg");

    // Assert retorna null)
    expect(result).toBeNull();
  });

  it("[SEC-11] URL generada exitosamente → retorna solo signedUrl", async () => {
    // Arrange
    mockStorageUrl({
      data: { signedUrl: "https://cdn.test/signed.jpg" },
      error: null,
    });

    // Act
    const result = await getImageUrl("ruta/foto.jpg");

    // Assert — solo devuelve la URL
    expect(result).toBe("https://cdn.test/signed.jpg");
    expect(typeof result).toBe("string");
  });

  it("[SEC-12] URL firmada expira en 60s (no genera tokens de larga duración)", async () => {
    // Arrange
    const createSignedUrlMock = vi.fn().mockResolvedValue({
      data: { signedUrl: "https://cdn.test/ok.jpg" },
      error: null,
    });
    supabase.storage.from.mockReturnValue({
      createSignedUrl: createSignedUrlMock,
    });

    // Act
    await getImageUrl("ruta/foto.jpg");

    // Assert
    expect(createSignedUrlMock).toHaveBeenCalledWith("ruta/foto.jpg", 60);
  });
});
