

export function detectarCambios(matrizOriginal, matrizEditable) {
    const cambios = []

    for (const cofreId in matrizEditable) {
        for (const cargoId in matrizEditable[cofreId]) {

            const original =
                matrizOriginal?.[cofreId]?.[cargoId] ?? ''

            const actual =
                matrizEditable?.[cofreId]?.[cargoId] ?? ''

            if (Number(original) !== Number(actual)) {
                cambios.push({
                    cofreId: Number(cofreId),
                    trabajadorCargoId: Number(cargoId),
                    valor: actual === '' ? null : Number(actual)
                })
            }
        }
    }

    return cambios
}