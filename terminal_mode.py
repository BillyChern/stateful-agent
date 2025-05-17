#!/usr/bin/env python3
import os
import sys
from pathlib import Path
from typing import Optional
from agent_manager import agent_manager

def print_help():
    """Print available commands."""
    print("""
Research Assistant Terminal Mode
==============================

Available Commands:
-----------------

Lab Management:
  create lab <name> at <institution> with leader <leader>
  add member <name> with scholar url <url> to <lab>
  add research areas <areas> to <lab>
  delete lab <name>

Paper Management:
  collect papers from <lab>
  check papers for <lab>
  recommend <number> papers from last <days> days for <lab>
  summarize latest paper from <lab>
  summarize latest paper by <author> from <lab>

LinkedIn Integration:
  share <paper_url> on linkedin with message <message>
  post summary of latest paper from <lab> on linkedin

General:
  help    - Show this help message
  exit    - Exit the program
  clear   - Clear the screen
""")

def process_command(command: str) -> None:
    """Process a terminal command."""
    try:
        response = agent_manager.process_message(command)
        print("\nResponse:", response, "\n")
    except Exception as e:
        print(f"\nError: {str(e)}\n")

def main():
    """Main terminal interface loop."""
    # Create necessary directories
    Path('data/recommendation').mkdir(parents=True, exist_ok=True)
    
    print("\nWelcome to Research Assistant Terminal Mode!")
    print("Type 'help' for available commands or 'exit' to quit.\n")
    
    while True:
        try:
            command = input("> ").strip()
            
            if not command:
                continue
                
            if command.lower() == 'exit':
                print("\nGoodbye!")
                sys.exit(0)
            elif command.lower() == 'help':
                print_help()
            elif command.lower() == 'clear':
                os.system('cls' if os.name == 'nt' else 'clear')
            else:
                process_command(command)
                
        except KeyboardInterrupt:
            print("\nUse 'exit' to quit.")
        except EOFError:
            print("\nGoodbye!")
            sys.exit(0)
        except Exception as e:
            print(f"\nError: {str(e)}\n")

if __name__ == "__main__":
    main() 