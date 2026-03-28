import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

type JsonTokenType = 'plain' | 'key' | 'string' | 'number' | 'boolean' | 'null';

interface JsonToken {
  text: string;
  type: JsonTokenType;
}

export interface JsonViewerDialogData {
  value: string;
}

@Component({
  selector: 'app-json-viewer-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="json-dialog">
      <div class="json-dialog-header">
        <div class="json-dialog-title-row">
          <mat-icon class="json-dialog-icon">data_object</mat-icon>
          <h2 class="json-dialog-title">Visualizar / Editar Evento</h2>
        </div>
        <button mat-icon-button class="close-btn" (click)="onCancelar()" aria-label="Fechar">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      @if (erroJson()) {
        <div class="json-error-banner">
          <mat-icon class="json-error-icon">warning</mat-icon>
          <span>A mensagem não está em formato JSON válido.</span>
        </div>
      }

      <div class="json-dialog-body">
        <div class="json-editor" [class.json-editor-invalid]="erroJson()">
          <pre #editorHighlight class="json-highlight" aria-hidden="true">@for (token of highlightedTokens(); track $index) {<span [class]="'token token--' + token.type">{{ token.text }}</span>}</pre>
          <textarea
            #editorTextarea
            class="json-textarea"
            [(ngModel)]="jsonText"
            (input)="onTextChange()"
            (scroll)="onEditorScroll()"
            spellcheck="false"
            autocomplete="off"
            autocorrect="off"
          ></textarea>
        </div>
      </div>

      <div class="json-dialog-actions">
        <button mat-button class="btn-cancelar" (click)="onCancelar()">Cancelar</button>
        <button mat-raised-button class="btn-atualizar itau-btn" (click)="onAtualizar()">
          <mat-icon>check</mat-icon> Atualizar Mensagem
        </button>
      </div>
    </div>
  `,
  styles: [`
    .json-dialog {
      display: flex;
      flex-direction: column;
      width: 100%;
      min-width: 320px;
      max-width: 620px;
      max-height: 90vh;
      overflow-x: hidden;
    }

    .json-dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 20px 12px;
      border-bottom: 1px solid var(--app-border, #e0e0e0);
    }

    .json-dialog-title-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .json-dialog-icon {
      color: #ec7000;
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    .json-dialog-title {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: var(--app-text-primary, #1a1a2e);
    }

    .close-btn {
      color: var(--app-text-secondary, #666);
    }

    .json-error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 12px 20px 0;
      padding: 8px 12px;
      background: rgba(198, 40, 40, 0.08);
      border: 1px solid rgba(198, 40, 40, 0.25);
      border-radius: 6px;
      font-size: 13px;
      color: #c62828;
    }

    .json-error-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #c62828;
    }

    .json-dialog-body {
      padding: 16px 20px;
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .json-editor {
      position: relative;
      width: 100%;
      min-height: 320px;
      border: 1px solid var(--app-border, #d0d0d0);
      border-radius: 6px;
      background: var(--app-surface, #fafafa);
      overflow: hidden;
      max-width: 100%;
    }

    .json-highlight,
    .json-textarea {
      width: 100%;
      min-height: 320px;
      font-family: 'Courier New', Courier, monospace;
      font-size: 12.5px;
      line-height: 1.6;
      padding: 12px;
      box-sizing: border-box;
      white-space: pre-wrap;
      word-break: break-word;
      tab-size: 2;
    }

    .json-highlight {
      margin: 0;
      color: #1f2937;
      overflow: hidden;
      pointer-events: none;
    }

    .json-textarea {
      position: absolute;
      inset: 0;
      margin: 0;
      border: none;
      border-radius: 0;
      background: transparent;
      color: transparent;
      resize: none;
      overflow-y: auto;
      overflow-x: hidden;
      outline: none;
      caret-color: #1a1a2e;

      &::selection {
        background: rgba(59, 130, 246, 0.35);
      }
    }

    .json-editor:focus-within {
      border-color: #ec7000;
      box-shadow: 0 0 0 1px #ec7000 inset;
    }

    .json-editor-invalid {
      border-color: #c62828;
      box-shadow: 0 0 0 1px rgba(198, 40, 40, 0.2) inset;
    }

    .token--plain { color: inherit; }
    .token--key { color: #0b5cab; }
    .token--string { color: #0f766e; }
    .token--number { color: #8b5cf6; }
    .token--boolean { color: #b45309; font-weight: 600; }
    .token--null { color: #be123c; font-weight: 600; }

    :host-context(html.dark-theme) .json-dialog-title {
      color: #ffffff;
    }

    :host-context(html.dark-theme) .json-editor {
      background: #111827;
      border-color: #374151;
    }

    :host-context(html.dark-theme) .json-highlight {
      color: #e5e7eb;
    }

    :host-context(html.dark-theme) .json-textarea {
      caret-color: #f3f4f6;
    }

    :host-context(html.dark-theme) .json-textarea::placeholder {
      color: #9ca3af;
    }

    :host-context(html.dark-theme) .json-dialog-header {
      border-bottom-color: #374151;
    }

    :host-context(html.dark-theme) .json-dialog-actions {
      border-top-color: #374151;
      background: #111827;
    }

    :host-context(html.dark-theme) .token--key { color: #60a5fa; }
    :host-context(html.dark-theme) .token--string { color: #34d399; }
    :host-context(html.dark-theme) .token--number { color: #c084fc; }
    :host-context(html.dark-theme) .token--boolean { color: #fbbf24; }
    :host-context(html.dark-theme) .token--null { color: #fb7185; }

    .json-dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 12px 20px 20px;
      border-top: 1px solid var(--app-border, #e0e0e0);
      background: var(--app-surface, #ffffff);
    }

    .btn-cancelar {
      color: var(--app-text-secondary, #666);
    }

    .btn-atualizar.itau-btn {
      background-color: #ec7000 !important;
      color: #fff !important;
      border: none !important;
      font-weight: 600 !important;
      font-size: 13px !important;
      padding: 0 28px !important;
      height: 40px !important;
      box-shadow: none !important;
      transition: background-color 0.2s !important;

      &:hover {
        background-color: #d56500 !important;
      }

      &:disabled {
        background-color: #ccc !important;
        color: #fff !important;
      }
    }

    @media (max-width: 640px) {
      .json-dialog {
        width: 96vw;
      }

      .json-dialog-body {
        padding: 12px;
      }

      .json-dialog-actions {
        padding: 10px 12px 12px;
      }
    }
  `],
})
export class JsonViewerDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<JsonViewerDialogComponent>);
  private readonly data: JsonViewerDialogData = inject(MAT_DIALOG_DATA);

  @ViewChild('editorTextarea') private editorTextarea?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('editorHighlight') private editorHighlight?: ElementRef<HTMLElement>;

  jsonText: string;
  erroJson = signal(false);
  highlightedTokens = signal<JsonToken[]>([]);

  constructor() {
    const raw = this.data?.value ?? '';
    this.jsonText = this.tryPrettyPrint(raw);
    this.erroJson.set(!this.isValidJson(this.jsonText));
    this.updateHighlightedPreview();
  }

  onTextChange(): void {
    this.erroJson.set(!this.isValidJson(this.jsonText));
    this.updateHighlightedPreview();
  }

  onEditorScroll(): void {
    const textarea = this.editorTextarea?.nativeElement;
    const highlight = this.editorHighlight?.nativeElement;
    if (!textarea || !highlight) return;
    highlight.scrollTop = textarea.scrollTop;
    highlight.scrollLeft = textarea.scrollLeft;
  }

  onAtualizar(): void {
    if (!this.isValidJson(this.jsonText)) {
      this.erroJson.set(true);
      return;
    }
    this.dialogRef.close(this.jsonText.trim());
  }

  onCancelar(): void {
    this.dialogRef.close(undefined);
  }

  private isValidJson(text: string): boolean {
    if (!text || !text.trim()) return false;
    try {
      JSON.parse(text.trim());
      return true;
    } catch {
      return false;
    }
  }

  private tryPrettyPrint(raw: string): string {
    if (!raw || !raw.trim()) return raw;
    try {
      return JSON.stringify(JSON.parse(raw.trim()), null, 2);
    } catch {
      return raw;
    }
  }

  private updateHighlightedPreview(): void {
    if (!this.isValidJson(this.jsonText)) {
      this.highlightedTokens.set([]);
      return;
    }

    const pretty = this.tryPrettyPrint(this.jsonText);
    this.highlightedTokens.set(this.tokenizeJson(pretty));
  }

  private tokenizeJson(json: string): JsonToken[] {
    const tokens: JsonToken[] = [];
    const regex = /("(?:\\.|[^"\\])*"|-?\d+(?:\.\d+)?(?:[eE][+\-]?\d+)?|\btrue\b|\bfalse\b|\bnull\b)/g;
    let cursor = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(json)) !== null) {
      const idx = match.index;
      const value = match[0];

      if (idx > cursor) {
        tokens.push({ text: json.slice(cursor, idx), type: 'plain' });
      }

      let type: JsonTokenType = 'plain';
      if (value.startsWith('"')) {
        const suffix = json.slice(regex.lastIndex);
        type = /^\s*:/.test(suffix) ? 'key' : 'string';
      } else if (value === 'true' || value === 'false') {
        type = 'boolean';
      } else if (value === 'null') {
        type = 'null';
      } else {
        type = 'number';
      }

      tokens.push({ text: value, type });
      cursor = regex.lastIndex;
    }

    if (cursor < json.length) {
      tokens.push({ text: json.slice(cursor), type: 'plain' });
    }

    return tokens;
  }
}
