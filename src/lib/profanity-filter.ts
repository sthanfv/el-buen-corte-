const PROHIBITED_WORDS = [
    'puto', 'puta', 'mierda', 'gonorrea', 'hijo de puta', 'malparido', 'perra', 'maricon',
    'sexo', 'porno', 'viola', 'droga', 'estafa', 'casino', 'bet', 'slot', 'crypto', 'whatsapp', 'wa.me'
];

export function hasProfanity(text: string): boolean {
    const normalized = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return PROHIBITED_WORDS.some(word => normalized.includes(word));
}

export function filterProfanity(text: string): string {
    let filtered = text;
    const normalized = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    PROHIBITED_WORDS.forEach(word => {
        const regex = new RegExp(word, 'gi');
        filtered = filtered.replace(regex, '***');
    });

    return filtered;
}
