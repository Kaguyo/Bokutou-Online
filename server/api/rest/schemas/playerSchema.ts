function validatePlayerSchema(player: any): boolean {
    if (typeof player !== 'object' || player === null) return false;
    if (typeof player.id !== 'string') return false;
    return true;
}

function validateGetPlayerByIdParams(params: string): boolean {
    if (params.length != 8) return false;
    if (params.trim() === '') return false;
    if (params.includes(' ')) return false;
    if (isDigitsOnly(params)) return false;
    return true;
}

function isDigitsOnly(str: string): boolean {
    return !/^\d+$/.test(str);
}

export { validatePlayerSchema, validateGetPlayerByIdParams };