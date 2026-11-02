export interface SkillMetadata {
    name: string;
    description: string;
    modelInvocable: boolean;
    userInvocable: boolean;
}
export declare const SKILL_NAME: RegExp;
export declare function parseSkill(content: string): SkillMetadata;
