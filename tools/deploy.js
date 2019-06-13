(() => {
    const fs = require("fs");
    const path = require("path");

    function copySimpleDir(source, target, filter) {
        fs.mkdirSync(target, { recursive: true });

        if (!filter) {
            filter = (_) => true;
        }

        for (const fileName of fs.readdirSync(source)) {
            if (filter(fileName)) {
                fs.copyFileSync(path.join(source, fileName), path.join(target, fileName));
            }
        }
    }

    const projectDir = path.dirname(__dirname);
    const demoDir = path.join(projectDir, "demo");
    const deployDir = path.join(projectDir, "public");

    copySimpleDir(demoDir, deployDir);

    const outDir = path.join(projectDir, "out");
    const libDir = path.join(deployDir, "tree-graph-generator");

    copySimpleDir(outDir, libDir, (fileName) => fileName.endsWith(".js"));
})();
