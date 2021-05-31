const fs = require('fs');
const { promisify } = require('util');
const path = require('path');
const { exec } = require('child_process'); 
const console = require('console');

const readdirPromise = promisify(fs.readdir);
const readFilePromise = promisify(fs.readFile)
const statPromise = promisify(fs.stat);
const execPromise = promisify(exec);

const modulePath = './modules';

const main = async () => {
    const data = await readdirPromise(modulePath);
    await Promise.all(
        data.map(async (folderName) => {
            const currentModulePath = path.join(modulePath, folderName)
            const packageJsonPath = path.join(currentModulePath, 'package.json')

            try {
                // Check that package.json exists
                await statPromise(packageJsonPath)
            } catch {
                return;
            }

            const pkgJson = JSON.parse((await readFilePromise(packageJsonPath)).toString());

            if (pkgJson['dependencies'] || pkgJson['devDependencies']) {
                // run install
                await execPromise('npm install', {
                    cwd: currentModulePath
                });

                console.log('installed ' + folderName);
            }


            if (pkgJson['toolkit']['needsBuild']) {
                // run build
                await new Promise(() => {
                    exec('npm run build', {
                        cwd: currentModulePath
                    }, (error, stdout, stderr) => {
                        console.log(stdout)
                        if (error || stderr) {
                            return
                        }
                        console.log('built ' + folderName);
                    });
                });
            }
        })
    );
}

main();