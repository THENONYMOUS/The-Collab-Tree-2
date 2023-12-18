// Load files
for (const filePath of modInfo.modFiles) {
    const script = document.createElement("script");
    script.src = `js/${filePath}`;
    document.head.appendChild(script);
}
