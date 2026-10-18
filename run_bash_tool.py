"""
title: run_bash
author: Musc1mo
version: 6.0.0 (Economy)
"""
import subprocess
import uuid

class Tools:
    def run_bash(self, command: str, background: bool = False) -> str:
        try:
            if background:
                log_file = f"/tmp/bash_{uuid.uuid4().hex[:6]}.log"
                subprocess.Popen(f"nohup {command} > {log_file} 2>&1 &", shell=True)
                return f"ЗАПУЩЕНО В ФОНЕ. Лог: {log_file}. Проверить: tail -n 15 {log_file}"
            else:
                result = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=300)
                out = result.stdout.strip()[:3000]
                err = result.stderr.strip()[:1000]
                if len(result.stdout) > 3000: out += "\n... [вывод обрезан]"
                if result.returncode == 0: return out if out else "Успешно (вывод пуст)."
                else: return f"ОШИБКА (код {result.returncode}):\n{out}\n{err}"
        except Exception as e:
            return f"ИСКЛЮЧЕНИЕ: {str(e)}"
