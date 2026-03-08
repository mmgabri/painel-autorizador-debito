Set WshShell = CreateObject("WScript.Shell")
WshShell.Run Chr(34) & ".bat" & Chr(34), 0, False
Set WshShell = Nothing