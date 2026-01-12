"""
Script para ordenar alfabéticamente las clases en modded_heroes.js
"""

import re
import json

def sort_modded_heroes():
    file_path = 'modded_heroes.js'
    
    # Leer el archivo
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extraer el header (export const...)
    header_match = re.match(r'^(.*?export const MODDED_HERO_CLASSES = \{)\s*\n', content, re.DOTALL)
    if not header_match:
        print("No se encontró el header esperado")
        return
    
    header = header_match.group(1)
    
    # Encontrar el cierre del objeto
    footer = '\n};\n'
    
    # Extraer el contenido del objeto (sin header ni footer)
    obj_start = header_match.end()
    obj_end = content.rfind('};')
    
    if obj_end == -1:
        print("No se encontró el cierre del objeto")
        return
    
    obj_content = content[obj_start:obj_end]
    
    # Parsear las clases individuales
    # Cada clase empieza con 'NombreClase': { y termina con },
    classes = {}
    
    # Regex para encontrar cada clase
    # Busca: 'Nombre': { ... },
    pattern = r"(\s*'([^']+)':\s*\{)"
    
    matches = list(re.finditer(pattern, obj_content))
    
    for i, match in enumerate(matches):
        class_name = match.group(2)
        start_pos = match.start()
        
        # Encontrar el final de esta clase (buscar el cierre de llaves correspondiente)
        brace_count = 0
        in_string = False
        escape_next = False
        end_pos = start_pos
        
        content_from_match = obj_content[match.end()-1:]  # Empezar desde la {
        
        for j, char in enumerate(content_from_match):
            if escape_next:
                escape_next = False
                continue
            if char == '\\':
                escape_next = True
                continue
            if char == "'" and not in_string:
                in_string = True
            elif char == "'" and in_string:
                in_string = False
            elif not in_string:
                if char == '{':
                    brace_count += 1
                elif char == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        end_pos = match.end() - 1 + j + 1
                        break
        
        # Extraer el contenido completo de la clase
        class_content = obj_content[start_pos:end_pos]
        
        # Remover coma final y espacios si existen
        class_content = class_content.rstrip()
        if class_content.endswith(','):
            class_content = class_content[:-1]
        
        classes[class_name] = class_content.strip()
    
    # Ordenar las clases alfabéticamente (case-insensitive)
    sorted_class_names = sorted(classes.keys(), key=lambda x: x.lower())
    
    # Reconstruir el contenido
    sorted_content = header + '\n'
    
    for i, class_name in enumerate(sorted_class_names):
        class_block = classes[class_name]
        # Asegurar indentación correcta
        lines = class_block.split('\n')
        # La primera línea debe tener 2 espacios de indentación
        if not lines[0].startswith('  '):
            lines[0] = '  ' + lines[0].lstrip()
        class_block = '\n'.join(lines)
        
        sorted_content += class_block
        if i < len(sorted_class_names) - 1:
            sorted_content += ','
        sorted_content += '\n'
    
    sorted_content += '};\n'
    
    # Guardar el archivo ordenado
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(sorted_content)
    
    print(f"✅ Archivo ordenado exitosamente!")
    print(f"📊 Total de clases: {len(sorted_class_names)}")
    print(f"\n📝 Primeras 10 clases (ordenadas):")
    for name in sorted_class_names[:10]:
        print(f"   - {name}")
    print(f"\n📝 Últimas 10 clases (ordenadas):")
    for name in sorted_class_names[-10:]:
        print(f"   - {name}")

if __name__ == '__main__':
    sort_modded_heroes()
