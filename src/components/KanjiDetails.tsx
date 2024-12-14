// File: components/KanjiDetails.tsx

import React, { useState } from "react";
import { KanjiDetail } from "../types/kanji";
import { KanjiCard } from "./KanjiCard";
import styles from "./KanjiDetails.module.css";

interface KanjiDetailsProps {
  kanjiData: KanjiDetail;
}

const KanjiDetails: React.FC<KanjiDetailsProps> = ({ kanjiData }) => {
  const [mnemonic, setMnemonic] = useState(kanjiData.mnemonic);
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
        body: JSON.stringify({ kanji: kanjiData.literal, mnemonic }),
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
      <h1 className={styles.kanji}>{kanjiData.literal}</h1>

      <div className={styles.meanings}>
        <strong>Meanings:</strong> {kanjiData.meanings.join(", ")}
      </div>
      <div className={styles.readings}>
        <strong>Onyomi:</strong> {kanjiData.readings.onYomi.join(", ")}
        <strong>Kunyomi:</strong> {kanjiData.readings.kunYomi.join(", ")}
      </div>


      { kanjiData.relatedKanji.length > 0 && (
        <div className={styles.kanjiSectionMobile}>
        <h4 className={styles.kanjiTitle}>Related Kanji:</h4>
        <div className={styles.miniKanjiList}>
          {kanjiData.relatedKanji.map((relatedKanji) => (
            <KanjiCard mini key={relatedKanji.literal} kanji={relatedKanji.literal} info={relatedKanji} />
          ))}
        </div>
      </div>
      )}
      
      <div className={styles.kanjiSectionMobile}>
        <h4 className={styles.kanjiTitle}>Mnemonic:</h4>
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
