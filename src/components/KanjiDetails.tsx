import React, { useState } from "react";
import styles from "./KanjiDetails.module.css";

interface KanjiDetailsProps {
  kanji: string;
  onyomi: string[];
  kunyomi: string[];
  similarKanji: string[];
  mnemonic: string;
}

const KanjiDetails: React.FC<KanjiDetailsProps> = ({
  kanji,
  onyomi,
  kunyomi,
  similarKanji,
  mnemonic: initialMnemonic,
}) => {
  const [mnemonic, setMnemonic] = useState(initialMnemonic);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const saveMnemonic = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const response = await fetch("/api/save-mnemonic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kanji, mnemonic }),
      });

      if (!response.ok) {
        throw new Error("Failed to save mnemonic. Please try again.");
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.kanji}>{kanji}</h1>

      <div className={styles.readings}>
        <strong>Onyomi:</strong> {onyomi.join(", ")}
        <strong>Kunyomi:</strong> {kunyomi.join(", ")}
      </div>

      <div className={styles.similarKanji}>
        <strong>Similar Kanji:</strong> {similarKanji.length > 0 ? similarKanji.join(", ") : "None"}
      </div>

      <div className={styles.mnemonic}>
        <strong>Mnemonic:</strong>
        <textarea
          className={styles.mnemonicInput}
          value={mnemonic}
          onChange={(e) => setMnemonic(e.target.value)}
          rows={4}
        />
        <div className={styles.mnemonicButtons}>
          <button
            className={styles.saveButton}
            onClick={saveMnemonic}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
        {success && <div className={styles.success}>Mnemonic saved successfully!</div>}
        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  );
};

export default KanjiDetails;
