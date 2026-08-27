import type { Machine, PredictionResult } from './types';
import { predict } from './predictionEngine';

// Mock AI explanation assistant. Generates templated natural-language
// responses from the machine's sensor values and prediction result.
// Structured so a real LLM API can be swapped in later by replacing
// `generateReply` with a network call.

interface AssistantContext {
  machine: Machine;
}

function formatSensors(m: Machine): string {
  const s = m.sensors;
  return [
    `Temperature: ${s.temperature.toFixed(1)} °C`,
    `Vibration: ${s.vibration.toFixed(2)} mm/s`,
    `Pressure: ${s.pressure.toFixed(2)} bar`,
    `Motor current: ${s.motorCurrent.toFixed(1)} A`,
    `RPM: ${s.rpm.toFixed(0)}`,
    `Operating hours: ${s.operatingHours.toFixed(0)} h`,
  ].join('\n');
}

const QUICK_REPLIES = [
  'Why is this machine showing a warning?',
  'What should I do about high vibration?',
  'How is the health score calculated?',
  'What is the most likely failure mode?',
];

function generateReply(question: string, ctx: AssistantContext): string {
  const m = ctx.machine;
  const result: PredictionResult = predict(m.type, m.sensors);
  const q = question.toLowerCase().trim();

  if (!q) {
    return 'Ask me anything about this machine — for example, "Why is the status warning?" or "What should I do about high vibration?"';
  }

  if (/why.*(warning|critical|alert|status)/.test(q)) {
    if (result.status === 'Healthy') {
      return `${m.name} is currently Healthy. All sensor readings are within nominal ranges, so no warning was raised.\n\nCurrent readings:\n${formatSensors(m)}`;
    }
    const reasons = result.reasons.length
      ? result.reasons.map((r) => `• ${r}`).join('\n')
      : 'No specific rule fired, but aggregate indicators are elevated.';
    return `${m.name} is showing ${result.status.toUpperCase()} because:\n\n${reasons}\n\nLikely fault: ${result.faultType ?? 'none'}.`;
  }

  if (/vibration/.test(q)) {
    const v = m.sensors.vibration;
    if (v > 7) {
      return `Vibration on ${m.name} is ${v.toFixed(2)} mm/s — critically high. This usually points to bearing degradation, imbalance, or misalignment. Recommendation: ${result.recommendedAction ?? 'stop the machine and inspect rotating components.'}`;
    }
    if (v > 4) {
      return `Vibration on ${m.name} is ${v.toFixed(2)} mm/s — above the warning threshold. Schedule a vibration analysis and inspect bearings and couplings within 48 hours.`;
    }
    return `Vibration on ${m.name} is ${v.toFixed(2)} mm/s — within normal range. No action needed.`;
  }

  if (/temperature|overheat|heat/.test(q)) {
    const t = m.sensors.temperature;
    if (t > 80) {
      return `Temperature on ${m.name} is ${t.toFixed(0)} °C — critically high. Shut down and inspect the cooling system, coolant level, and ventilation before restarting.`;
    }
    if (t > 60) {
      return `Temperature on ${m.name} is ${t.toFixed(0)} °C — elevated. Check cooling and reduce load if possible.`;
    }
    return `Temperature on ${m.name} is ${t.toFixed(0)} °C — within normal range.`;
  }

  if (/health|score/.test(q)) {
    return `The health score for ${m.name} is ${result.healthScore}/100. It starts at 100 and is reduced for every rule that fires — critical issues deduct ~35 points, warnings ~18. A score below 60 means the machine is at high risk of failure.`;
  }

  if (/failure|fault|breakdown|fail/.test(q)) {
    return result.faultType
      ? `The most likely failure mode for ${m.name} right now is: ${result.faultType}. Recommended action: ${result.recommendedAction}`
      : `No specific fault detected for ${m.name}. All parameters are within nominal ranges.`;
  }

  if (/what.*do|action|recommend|mainten/.test(q)) {
    return result.recommendedAction
      ? `Recommended action for ${m.name}: ${result.recommendedAction}`
      : `No maintenance action is required for ${m.name} at this time. Continue routine monitoring.`;
  }

  if (/pressure/.test(q)) {
    const p = m.sensors.pressure;
    return `Pressure on ${m.name} is ${p.toFixed(2)} bar. ${p > 8 ? 'This is high — inspect valves and relief systems.' : p < 2 ? 'This is low — check for leaks or blockages.' : 'Within normal range.'}`;
  }

  if (/current|amp|motor/.test(q)) {
    const c = m.sensors.motorCurrent;
    return `Motor current on ${m.name} is ${c.toFixed(1)} A. ${c > 18 ? 'High current indicates overload — reduce load and inspect windings.' : 'Within normal range.'}`;
  }

  if (/rpm|speed/.test(q)) {
    return `RPM on ${m.name} is ${m.sensors.rpm.toFixed(0)}. ${Math.abs(m.sensors.rpm - 2950) > 300 ? 'Significant deviation from nominal — inspect drive and controller.' : 'Within normal range.'}`;
  }

  // Default: give a concise status summary.
  return `Here's a summary for ${m.name}:\n\nStatus: ${result.status}\nHealth score: ${result.healthScore}/100\nFailure probability: ${result.failureProbability}%\n${result.faultType ? `Likely fault: ${result.faultType}` : 'No fault detected.'}\n\nCurrent readings:\n${formatSensors(m)}`;
}

export const aiAssistant = {
  generateReply,
  quickReplies: QUICK_REPLIES,
};
