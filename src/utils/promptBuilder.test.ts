import { describe, it, expect } from 'vitest';
import { buildApiBasePrompt, addShotInstruction } from './promptBuilder';
import { FormDataState, ShotLabelKey } from '../types';

describe('promptBuilder', () => {
  const mockFormData: FormDataState = {
    productName: '時尚風衣',
    clothingStyle: '都會商務',
    clothingSeason: '秋季',
    modelGender: '女性模特兒',
    background: '城市街景',
    expression: '自信微笑',
    pose: '插口袋',
    lighting: '自然光',
    aspectRatio: '1:1',
    imageModel: 'gemini-2.5-flash-image',
    faceImage: null,
    objectImage: null,
    poseImage: null,
    expressionImage: null,
    angleImage: null,
    additionalDescription: '高級質感',
  };

  it('應該生成正確的基底 Prompt', () => {
    const basePrompt = buildApiBasePrompt(mockFormData);
    expect(basePrompt).toContain('時尚風衣');
    expect(basePrompt).toContain('都會商務');
    expect(basePrompt).toContain('female model');
    expect(basePrompt).toContain('城市街景');
    expect(basePrompt).toContain('自信微笑');
    expect(basePrompt).toContain('插口袋');
    expect(basePrompt).toContain('自然光');
    expect(basePrompt).toContain('高級質感');
  });

  it('應該正確附加鏡頭景別指示詞', () => {
    const basePrompt = '這是一個測試 Prompt';
    
    const fullBody = addShotInstruction(basePrompt, 'fullBody');
    expect(fullBody).toContain('full-body shot');
    expect(fullBody).toContain('head to toe');

    const medium = addShotInstruction(basePrompt, 'medium');
    expect(medium).toContain('medium shot');
    expect(medium).toContain('waist up');

    const closeUp = addShotInstruction(basePrompt, 'closeUp');
    expect(closeUp).toContain('close-up shot');
    expect(closeUp).toContain('head and shoulders');
  });
});
