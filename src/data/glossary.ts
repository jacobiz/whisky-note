export type GlossaryCategory =
  | 'tasting-process'
  | 'flavour-wheel'
  | 'mouthfeel'
  | 'finish'
  | 'production'
  | 'region'
  | 'general'

export interface GlossaryTerm {
  id: string
  termJa: string
  termEn: string
  category: GlossaryCategory
  definitionJa: string
  definitionEn: string
  examplesJa?: string[]
  examplesEn?: string[]
}

export interface GlossaryData {
  version: 1
  terms: GlossaryTerm[]
}
