export class TanukiKanjiLesson {
  readonly content: string;

  private constructor(content: string) {
    this.content = content;
  }

  static create(rawContent: string): TanukiKanjiLesson {
    return new TanukiKanjiLesson(rawContent.trim());
  }
}
