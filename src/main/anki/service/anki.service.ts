import type { YankiConnect } from 'yanki-connect';

export class AnkiService {
  private clientPromise: Promise<YankiConnect>;

  constructor() {
    // Dynamically import ESM package in CJS environment
    this.clientPromise = import('yanki-connect').then(module => new module.YankiConnect());
  }

  public async getDecks() {
    try {
      const client = await this.clientPromise;
      const decks = await client.deck.deckNames();
      return { success: true, data: decks };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  public async getModels() {
    try {
      const client = await this.clientPromise;
      const models = await client.model.modelNames();
      return { success: true, data: models };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private getModelCss() {
    return `
/* General Card Settings */
.card {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 16px;
  color: #2d3748;
  background-color: #edf2f7;
  text-align: center;
  line-height: 1.6;
  margin: 0;
  padding: 20px;
}

/* Card Containers */
.card-content, .back-content {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  margin: 0 auto;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(0, 0, 0, 0.03);
  border: 1px solid #e2e8f0;
}
.back-content {
  margin-top: 20px;
}

/* Typography & Colors */
.word {
  font-size: 42px;
  font-weight: 800;
  color: #1a202c;
  letter-spacing: -1px;
  margin-bottom: 4px;
  text-transform: capitalize;
}

.phonetics {
  font-size: 18px;
  color: #718096;
  font-family: "JetBrains Mono", "Courier New", Courier, monospace;
  margin-bottom: 24px;
  background: #f7fafc;
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid #edf2f7;
}

/* Translations Section */
.translations {
  text-align: left;
  margin-top: 20px;
  padding: 16px;
  background: #ebf8ff;
  border-radius: 12px;
  border-left: 4px solid #3182ce;
}
.translations .pos-group b {
  color: #2b6cb0;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: #bee3f8;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 8px;
}
.translations ul {
  list-style: none;
  padding-left: 0;
  margin: 0 0 16px 0;
}
.translations li {
  font-size: 18px;
  color: #2c5282;
  margin-bottom: 4px;
  position: relative;
  padding-left: 16px;
}
.translations li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #3182ce;
}

/* Explanations Section */
.explanations {
  text-align: left;
  margin-top: 24px;
}
.explanations .pos-group {
  margin-bottom: 24px;
}
.explanations .pos-group b {
  color: #4a5568;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: #e2e8f0;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 12px;
}
.explanations ul {
  list-style: none;
  padding-left: 0;
  margin: 0;
}
.explanations > ul > li {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px dashed #e2e8f0;
}
.explanations > ul > li:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}
.explanations .def {
  font-size: 16px;
  color: #2d3748;
  font-weight: 500;
  margin-bottom: 8px;
}
.explanations .examples {
  background: #f7fafc;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 3px solid #a0aec0;
  margin-top: 8px;
}
.explanations .examples li {
  margin-bottom: 12px;
}
.explanations .examples li:last-child {
  margin-bottom: 0;
}
.explanations .examples i {
  color: #4a5568;
  display: block;
  font-size: 15px;
  margin-bottom: 4px;
}
.explanations .examples small {
  color: #718096;
  font-size: 14px;
}

/* Hide default Anki line */
hr#answer {
  display: none;
}
`;
  }

  public async createModels() {
    const fields = ['Word', 'Phonetics', 'Audio', 'Translations', 'Explanations'];
    const css = this.getModelCss();

    const type1Name = 'ACM_Type1_EN2ZH';
    const type2Name = 'ACM_Type2_ZH2EN';

    try {
      const client = await this.clientPromise;
      const existingModels = await client.model.modelNames();

      if (!existingModels.includes(type1Name)) {
        await client.model.createModel({
          modelName: type1Name,
          inOrderFields: fields,
          css: css,
          isCloze: false,
          cardTemplates: [
            {
              Name: 'Card 1',
              Front: `<div class="card-content">
  <div class="word">{{Word}}</div>
  <div class="phonetics">{{Phonetics}}</div>
  {{Audio}}
</div>`,
              Back: `{{FrontSide}}
<div class="back-content">
  <div class="translations">{{Translations}}</div>
  <div class="explanations">{{Explanations}}</div>
</div>
<script>
  var audios = document.getElementsByTagName("audio");
  if(audios.length > 0) audios[0].play();
</script>`
            }
          ]
        });
      }

      if (!existingModels.includes(type2Name)) {
        await client.model.createModel({
          modelName: type2Name,
          inOrderFields: fields,
          css: css,
          isCloze: false,
          cardTemplates: [
            {
              Name: 'Card 1',
              Front: `<div class="card-content">
  <div class="translations">{{Translations}}</div>
</div>`,
              Back: `{{FrontSide}}
<div class="back-content">
  <div class="word">{{Word}}</div>
  <div class="phonetics">{{Phonetics}}</div>
  {{Audio}}
  <div class="explanations">{{Explanations}}</div>
</div>
<script>
  var audios = document.getElementsByTagName("audio");
  if(audios.length > 0) audios[0].play();
</script>`
            }
          ]
        });
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  public async storeMediaFile(filename: string, url: string) {
    try {
      const client = await this.clientPromise;
      await client.media.storeMediaFile({
        filename,
        url
      });
      return { success: true, filename };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  public async addNote(deckName: string, modelName: string, fields: Record<string, string>, audioUrl?: string) {
    try {
      const client = await this.clientPromise;
      let audioFieldContent = fields.Audio || '';
      
      // If there's an audio URL, store it and create the Anki audio tag
      if (audioUrl) {
        // Create a safe filename
        const safeWord = fields.Word.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `acm_${safeWord}_${Date.now()}.mp3`;
        
        const mediaResult = await this.storeMediaFile(filename, audioUrl);
        if (mediaResult.success) {
          audioFieldContent = `[sound:${filename}]`;
        }
      }

      const note = {
        deckName,
        modelName,
        fields: {
          ...fields,
          Audio: audioFieldContent
        },
        options: {
          allowDuplicate: false,
          duplicateScope: 'deck'
        },
        tags: ['AnkiCardMaker']
      };

      const result = await client.note.addNote({ note });
      return { success: true, noteId: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
