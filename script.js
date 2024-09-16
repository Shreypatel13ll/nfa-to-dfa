class NFA {
  constructor(states, alphabet, transitions, startState, acceptStates) {
    this.states = states;
    this.alphabet = alphabet;
    this.transitions = transitions; // {state: {symbol: [nextStates]}}
    this.startState = startState;
    this.acceptStates = acceptStates;
  }
}

class DFA {
  constructor(states, alphabet, transitions, startState, acceptStates) {
    this.states = states;
    this.alphabet = alphabet;
    this.transitions = transitions; // {state: {symbol: nextState}}
    this.startState = startState;
    this.acceptStates = acceptStates;
  }
}

function convertNFAtoDFA(nfa) {
  const dfaStates = new Map();
  const dfaTransitions = {};
  const dfaAcceptStates = new Set();
  const dfaQueue = [];

  const startState = epsilonClosure([nfa.startState], nfa.transitions);
  const startStateKey = stateSetToString(startState);
  dfaQueue.push(startStateKey);
  dfaStates.set(startStateKey, startState);

  while (dfaQueue.length > 0) {
    const currentDfaState = dfaQueue.shift();
    const currentNfaStates = dfaStates.get(currentDfaState);

    if (currentNfaStates.some((state) => nfa.acceptStates.has(state))) {
      dfaAcceptStates.add(currentDfaState);
    }

    dfaTransitions[currentDfaState] = {};

    for (const symbol of nfa.alphabet) {
      const nextNfaStates = epsilonClosure(
        currentNfaStates.flatMap(
          (state) => nfa.transitions[state]?.[symbol] || []
        ),
        nfa.transitions
      );

      if (nextNfaStates.length > 0) {
        const nextDfaState = stateSetToString(nextNfaStates);

        if (!dfaStates.has(nextDfaState)) {
          dfaQueue.push(nextDfaState);
          dfaStates.set(nextDfaState, nextNfaStates);
        }

        dfaTransitions[currentDfaState][symbol] = nextDfaState;
      }
    }
  }

  const dfaStartState = startStateKey;
  const dfa = new DFA(
    Array.from(dfaStates.keys()),
    nfa.alphabet,
    dfaTransitions,
    dfaStartState,
    Array.from(dfaAcceptStates)
  );

  return dfa;
}

function epsilonClosure(states, transitions) {
  const closure = new Set(states);
  const stack = [...states];

  while (stack.length > 0) {
    const state = stack.pop();
    const epsilonStates = transitions[state]?.[""] || [];

    for (const nextState of epsilonStates) {
      if (!closure.has(nextState)) {
        closure.add(nextState);
        stack.push(nextState);
      }
    }
  }

  return Array.from(closure);
}

function stateSetToString(states) {
  return `{${states.sort().join(",")}}`;
}

// Function to convert DFA to Graphviz (DOT) code
function dfaToGraphviz(dfa) {
  let dot = "digraph DFA {\n";
  dot += "    rankdir=LR;\n"; // Left to right orientation
  dot += "    node [shape=circle];\n";

  // Mark accept states with double circles
  for (const state of dfa.acceptStates) {
    dot += `    "${state}" [shape=doublecircle];\n`;
  }

  // Mark start state with a pointing arrow
  dot += `    "" -> "${dfa.startState}";\n`;

  // Add transitions
  for (const [state, transitions] of Object.entries(dfa.transitions)) {
    for (const [symbol, nextState] of Object.entries(transitions)) {
      dot += `    "${state}" -> "${nextState}" [label="${symbol}"];\n`;
    }
  }

  dot += "}";
  return dot;
}

// Function to convert NFA to Graphviz (DOT) code
function nfaToGraphviz(nfa) {
  let dot = "digraph NFA {\n";
  dot += "    rankdir=LR;\n"; // Left to right orientation
  dot += "    node [shape=circle];\n";

  // Mark accept states with double circles
  for (const state of nfa.acceptStates) {
    dot += `    "${state}" [shape=doublecircle];\n`;
  }

  // Mark start state with a pointing arrow
  dot += `    "" -> "${nfa.startState}";\n`;

  // Add transitions
  for (const [state, transitions] of Object.entries(nfa.transitions)) {
    for (const [symbol, nextStates] of Object.entries(transitions)) {
      for (const nextState of nextStates) {
        const label = symbol === "" ? "ε" : symbol;
        dot += `    "${state}" -> "${nextState}" [label="${label}"];\n`;
      }
    }
  }

  dot += "}";
  return dot;
}

// Parse form input and generate NFA/DFA
document
  .getElementById("nfa-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const states = document
      .getElementById("states")
      .value.split(",")
      .map((s) => s.trim());
    const alphabet = document
      .getElementById("alphabet")
      .value.split(",")
      .map((s) => s.trim());

    const transitionInput = document
      .getElementById("transitions")
      .value.split(";");
    const transitions = {};
    transitionInput.forEach((tr) => {
      const [state, symbol, nextStates] = tr.split("-");
      if (!transitions[state]) transitions[state] = {};
      transitions[state][symbol] = nextStates.split(",").map((s) => s.trim());
    });

    const startState = document.getElementById("start-state").value.trim();
    const acceptStates = new Set(
      document
        .getElementById("accept-states")
        .value.split(",")
        .map((s) => s.trim())
    );

    const nfa = new NFA(
      states,
      alphabet,
      transitions,
      startState,
      acceptStates
    );

    // Convert NFA to DFA
    const dfa = convertNFAtoDFA(nfa);

    // Convert NFA and DFA to Graphviz DOT code
    const nfaGraphvizCode = nfaToGraphviz(nfa);
    const dfaGraphvizCode = dfaToGraphviz(dfa);

    // Render NFA and DFA graphs
    const viz = new Viz();
    viz.renderSVGElement(nfaGraphvizCode).then(function (svgElement) {
      const nfaGraphDiv = document.getElementById("nfa-graph");
      nfaGraphDiv.innerHTML = ""; // Clear previous graph
      nfaGraphDiv.appendChild(svgElement);
    });

    viz.renderSVGElement(dfaGraphvizCode).then(function (svgElement) {
      const dfaGraphDiv = document.getElementById("dfa-graph");
      dfaGraphDiv.innerHTML = ""; // Clear previous graph
      dfaGraphDiv.appendChild(svgElement);
    });
  });

// Example usage:

// const nfa = new NFA(
//     ['q0', 'q1', 'q2'],
//     ['a', 'b'],
//     {
//         'q0': { 'a': ['q0', 'q1'], 'b': ['q0'] },
//         'q1': { 'a': ['q2'], 'b': [] },
//         'q2': { 'a': [], 'b': [] }
//     },
//     'q0',
//     new Set(['q2'])
// );
