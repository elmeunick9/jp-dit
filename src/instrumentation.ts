export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { jmdict } = await import("./utils/jmdict");
        // await jmdict.initialize();
    }
}