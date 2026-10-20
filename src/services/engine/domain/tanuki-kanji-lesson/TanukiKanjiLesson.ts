export class TanukiKanjiLesson {
  readonly text: string;

  private constructor(text: string) {
    this.text = text;
  }

  static create(rawText: string): TanukiKanjiLesson {
    return new TanukiKanjiLesson(rawText.trim());
  }
}
