# Model Catalog: Groq and OpenRouter

This document lists active chat models configured in this repository under the Groq and OpenRouter providers.

Fields included for each model:

- provider_code
- temperature
- system_prompt (short excerpt)
- max_completion_tokens
- top_p
- stream
- stop
- provider: "openrouter" | "groq"
- image_support: true | false
- pdf_support: true | false
- active: true | false

Notes:

- Values are taken from the model implementations in `src/models/groq` and `src/models/openrouter`.
- Where `top_p` or `stop` is not explicitly set in code, `top_p` is shown as `1` and `stop` as `null`.
- `image_support` is true when the model implementation calls `ImageParser` to attach images; `pdf_support` is true when `DocumentParse` or PDF handling appears.

---

## Groq

### meta-llama/llama-4-scout-17b-16e-instruct

- provider_code: "meta-llama/llama-4-scout-17b-16e-instruct"
- temperature: 1
- system_prompt: "You are Llama Scout, an intelligent and highly reliable general-purpose AI assistant..."
- max_completion_tokens: 8192
- top_p: 1
- stream: true
- stop: null
- provider: "groq"
- image_support: true
- pdf_support: false
- active: true

### qwen/qwen3-32b

- provider_code: "qwen/qwen3-32b"
- temperature: 0.6
- system_prompt: "You are a highly capable conversational AI whose role is to assist, explain, and problem-solve with clarity..."
- max_completion_tokens: 40960
- top_p: 0.95
- stream: true
- stop: null
- provider: "groq"
- image_support: false
- pdf_support: false
- active: true

### openai/gpt-oss-20b (Groq)

- provider_code: "openai/gpt-oss-20b"
- temperature: 0.8
- system_prompt: "You are a helpful, knowledgeable, and friendly AI assistant designed to provide clear, natural, and supportive conversations..."
- max_completion_tokens: 8192
- top_p: 1
- stream: true
- stop: null
- provider: "groq"
- image_support: false
- pdf_support: false
- active: true

### compound-beta

- provider_code: "compound-beta"
- temperature: 1
- system_prompt: "You are Compound, a highly capable AI designed to assist with a wide range of tasks..."
- max_completion_tokens: 8192
- top_p: 1
- stream: true
- stop: null
- provider: "groq"
- image_support: false
- pdf_support: false
- active: true

### llama-3.1-8b-instant (llama-8.1b-instant entry)

- provider_code: "llama-3.1-8b-instant"
- temperature: 0.5
- system_prompt: "You are an intelligent, precise, and tool-augmented AI assistant..."
- max_completion_tokens: 16384 (second streamed completion uses 16384; primary uses 8192)
- top_p: 1
- stream: true
- stop: null
- provider: "groq"
- image_support: true
- pdf_support: false
- active: true

---

## OpenRouter

### openai/gpt-oss-20b:free

- provider_code: "openai/gpt-oss-20b:free"
- temperature: 0.9
- system_prompt: "You are a helpful, knowledgeable, and friendly AI assistant designed to provide clear, natural, and supportive conversations..."
- max_completion_tokens: 8192
- top_p: 1
- stream: true
- stop: null
- provider: "openrouter"
- image_support: false
- pdf_support: false
- active: true

### deepseek/deepseek-r1-0528:free

- provider_code: "deepseek/deepseek-r1-0528:free"
- temperature: 0.8
- system_prompt: "You are a highly capable conversational AI whose role is to assist, explain, and problem-solve with clarity..."
- max_completion_tokens: 40000
- top_p: 0.95
- stream: true
- stop: null
- provider: "openrouter"
- image_support: false
- pdf_support: false
- active: true

### mistralai/devstral-small-2505:free

- provider_code: "mistralai/devstral-small-2505:free"
- temperature: 0.8
- system_prompt: "You are Devstral, a friendly, highly knowledgeable, and exceptionally practical coding assistant..."
- max_completion_tokens: 8192
- top_p: 1
- stream: true
- stop: null
- provider: "openrouter"
- image_support: false
- pdf_support: false
- active: true

### cognitivecomputations/dolphin-mistral-24b-venice-edition:free

- provider_code: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free"
- temperature: 0.15
- system_prompt: "You are an uncensored AI model designed to provide unfiltered and unbiased information..."
- max_completion_tokens: 8192
- top_p: 1
- stream: true
- stop: null
- provider: "openrouter"
- image_support: false
- pdf_support: false
- active: true

### microsoft/phi-4-reasoning:free

- provider_code: "microsoft/phi-4-reasoning:free"
- temperature: 0.8
- system_prompt: "You are Phi4 — a thoughtful, articulate, and deeply insightful general-purpose reasoning assistant..."
- max_completion_tokens: 24000
- top_p: 1
- stream: true
- stop: null
- provider: "openrouter"
- image_support: false
- pdf_support: false
- active: true

### microsoft/phi-4-reasoning-plus:free

- provider_code: "microsoft/phi-4-reasoning-plus:free"
- temperature: 0.8
- system_prompt: "You are Phi4Plus — a highly articulate, deeply insightful, and unshakably logical reasoning assistant..."
- max_completion_tokens: 24000
- top_p: 1
- stream: true
- stop: null
- provider: "openrouter"
- image_support: false
- pdf_support: false
- active: true

### sarvamai/sarvam-m:free

- provider_code: "sarvamai/sarvam-m:free"
- temperature: 0.8
- system_prompt: "You are Sarvam, a multilingual AI assistant trained in English and 11 major Indic languages..."
- max_completion_tokens: 8192
- top_p: 1
- stream: true
- stop: null
- provider: "openrouter"
- image_support: false
- pdf_support: false
- active: true

---

If you want this file in a different format (JSON/YAML) or to include additional fields (cost, latency estimates, or example usage), tell me which format and I'll add it.
