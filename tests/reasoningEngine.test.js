import assert from 'assert';
import { reasoningEngine } from '../src/services/reasoningEngine.js';

console.log('🧪 Testing Logical Reasoning & Chain-of-Thought (CoT) Engine...');

// 1. Test Goal Decomposition for complex prompt
const prompt = "Tokyoda oyiga 350000 yen maosh beradigan katta yuk mashinasi ishini top va ariza topshir";
const steps = reasoningEngine.decomposeGoal(prompt);
console.log(`💬 Multi-step prompt: "${prompt}"`);
console.log(`📋 Decomposed into ${steps.length} steps:`, steps);

assert.strictEqual(steps.length, 2, 'Should decompose prompt into 2 sequential steps');
assert.strictEqual(steps[0].action, 'FILTER_JOBS', 'First step should filter jobs');
assert.strictEqual(steps[0].params.prefecture, 'Tokyo', 'First step should extract Tokyo prefecture');
assert.strictEqual(steps[0].params.minSalary, 350000, 'First step should extract 350,000 JPY salary');
assert.strictEqual(steps[0].params.license, '大型', 'First step should extract Heavy license');
assert.strictEqual(steps[1].action, 'CONFIRM_APPLICATION', 'Second step should prepare application confirmation');

// 2. Test License and Job compatibility inference
const profile = { licenseHeld: '普通', visaType: 'Student' };
const compatibility = reasoningEngine.inferJobCompatibility(profile);
console.log('💡 Compatibility Inference:', compatibility);
assert(compatibility.restrictions.length >= 2, 'Should infer at least 2 restrictions');
assert(compatibility.recommendations.length >= 1, 'Should recommend license upgrade academy');

// 3. Test Step-by-step reasoning summary
const reasoning = reasoningEngine.reasonStepByStep("Musiqa qo'y");
console.log('💭 Reasoning output:', reasoning.reasoningText);
assert(reasoning.reasoningText.includes('MANTIQIY TAHLIL'), 'Reasoning text should include CoT header');

console.log('🎉 All Logical Reasoning Engine unit tests PASSED!');
