#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const { optimize } = require('svgo');

// Definir los argumentos de la línea de comandos
program
  .argument('<svgFile>', 'SVG file to convert')
  .action((svgFile) => {
    const svgPath = path.resolve(process.cwd(), svgFile);
    const componentName = path.basename(svgFile, path.extname(svgFile)) + '.astro';

    // Leer el archivo SVG
    fs.readFile(svgPath, 'utf-8', (err, data) => {
      if (err) {
        console.error(`Error reading file ${svgFile}:`, err);
        process.exit(1);
      }

      // Optimizar el SVG
      const optimizedSvg = optimize(data, {
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                removeViewBox: false,
              },
            },
          },
        ],
      }).data;

      // Crear el componente Astro
      const astroComponent = `
---
const { width = '24', height = '24', color = 'currentColor' } = Astro.props;
---

${optimizedSvg
        .replace(/width="[^"]*"/, 'width={width}')
        .replace(/height="[^"]*"/, 'height={height}')
        .replace(/fill="[^"]*"/g, 'fill={color}')}
`;

      // Guardar el componente Astro
      const outputPath = path.resolve(process.cwd(), componentName);
      fs.writeFile(outputPath, astroComponent.trim(), (writeErr) => {
        if (writeErr) {
          console.error(`Error writing component ${componentName}:`, writeErr);
          process.exit(1);
        }
        console.log(`Component ${componentName} created successfully!`);
      });
    });
  });

program.parse();
