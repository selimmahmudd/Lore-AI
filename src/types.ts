export interface StoryAnalysis {
  extractedText: string;
  visualSummary: string;
  settingMood: string;
  ghostwrittenParagraph: string;
}

export interface VoiceProfile {
  id: string;
  name: string;
  rate: number;
  pitch: number;
  description: string;
  isMarkedlySynthetic: boolean;
}

export const VOICE_PROFILES: VoiceProfile[] = [
  {
    id: "cybernetic",
    name: "Cybernetic Entity (MK-V)",
    rate: 1.15,
    pitch: 1.45,
    description: "Highly synthesized, metallic and fast pitch modulation. Clearly AI-generated.",
    isMarkedlySynthetic: true,
  },
  {
    id: "system_voice",
    name: "Standard Neutral Android",
    rate: 1.0,
    pitch: 0.85,
    description: "Low-frequency steady artificial cadence, styled to mimic early console interfaces.",
    isMarkedlySynthetic: true,
  },
  {
    id: "sub_aquatic",
    name: "Oscillating Deep Thinker",
    rate: 0.85,
    pitch: 0.6,
    description: "Extremely deep, slowed robotic pitch designed to emphasize artificial speech simulation.",
    isMarkedlySynthetic: true,
  },
  {
    id: "beaming_assistant",
    name: "Friendly Beaming Synthesizer",
    rate: 1.05,
    pitch: 1.2,
    description: "Bouncy, light artificial narrator with distinctive electronic vocal tags.",
    isMarkedlySynthetic: false,
  }
];
