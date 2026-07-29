BILL AND ONEIRO

Two local-first systems exploring what small models can do without a datacentre.

--------------------------------------------------------------------------
BILL -- a local-first conversational system

A local language model wrapped in retrieval, durable memory, planning, grounding
and verification, paired with a separate from-scratch predictor that can be read
line by line.

  Durable, user-confirmed memory that survives restarts
  Prioritised retrieval across a local corpus, a knowledge store, and web search
  A planning pass, an evidence contract, a factual verifier, a response gate
  bill2, the from-scratch core, reachable via /legacy

MODEL ATTRIBUTION, STATED PLAINLY
  The coherent prose comes from a local Llama 3.2 3B served through Ollama. The
  project does NOT claim that the from-scratch bill2 weights produce that prose.
  What Bill contributes is the orchestration around them.

  bill2 itself is written without ML frameworks -- a predictive concept graph
  with its own training, consolidation and calibration, developed across ten
  measured iterations each evaluated on held-out data, covering unit and neural
  recall, sleep-style replay consolidation, beam-traced reasoning, imitation
  learning, and calibration with measured expected calibration error.

Repository: github.com/jcooperkai-sys/Bill

--------------------------------------------------------------------------
ONEIRO -- a continuously running generative art system

A local model free-associates one word at a time. Each idea becomes a training
example for a pixel-art generator written from scratch in NumPy, which then
paints that idea from its own weights. Output streams to a live gallery. It runs
indefinitely and keeps learning while it runs.

  The teacher is independent of the student, so the generator never trains on its
  own samples -- the mechanism behind model collapse in self-training setups.
  Learning is online and persistent; state resumes between runs.
  Open vocabulary: unknown words are routed to an artist agent that designs a new
  sprite as drawing primitives, which the renderer draws.

Repository: github.com/jcooperkai-sys/Oneiro
