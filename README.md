# NFA to DFA Conversion
Try it at : https://shreypatel13ll.github.io/nfa-to-dfa/

## Overview

This project implements an algorithm in JavaScript that converts a **Non-deterministic Finite Automaton (NFA)** into a **Deterministic Finite Automaton (DFA)**. The solution focuses on simplifying the problem by assuming that every state has only outgoing transitions based on two input symbols (`a` and `b`).

This repository is a part of a college assignment that demonstrates key concepts in automata theory, particularly how to transform an NFA with epsilon (ε) transitions and multiple transitions for a given input symbol into a DFA, which has a single transition for each symbol per state.

## Key Concepts

- **NFA (Non-deterministic Finite Automaton)**: 
  - An NFA can have multiple transitions for a single input symbol.
  - It can also move between states without consuming an input symbol (epsilon transitions).
  
- **DFA (Deterministic Finite Automaton)**:
  - A DFA has exactly one transition for each symbol in the alphabet from each state.
  - DFAs do not have epsilon transitions, and every input string leads to a deterministic outcome (accept or reject).

This algorithm takes the following steps:
1. **Define the NFA**: States, transitions, alphabet, start state, and accept states.
2. **Initialize DFA Structures**: Create a queue to process new DFA states and maps to store DFA transitions.
3. **Process NFA Transitions**: For each DFA state, determine the set of NFA states it represents and compute new DFA states based on transitions for each input symbol.
4. **Store DFA States and Transitions**: Track transitions and accepting states as new DFA states are generated.

## Code Explanation

Here is a detailed explanation of the algorithm and the code:

### 1. NFA Definition

We define an NFA using a JavaScript object that includes:
- **States**: The different states in the NFA.
- **Alphabet**: The set of input symbols, which in this case are `['a', 'b']`.
- **Transitions**: A mapping from each state and input symbol to a set of states (i.e., where the NFA transitions to for each symbol).
- **Start State**: The initial state of the NFA.
- **Accept States**: States where the NFA accepts the input string.

### 2. Converting NFA to DFA

```javascript
function convertNFAtoDFA(nfa) {
    const dfaStates = new Map(); // Maps DFA state names to corresponding sets of NFA states
    const dfaTransitions = {};   // DFA transitions
    const dfaAcceptStates = new Set(); // DFA accepting states
    const dfaQueue = [];         // Queue for processing DFA states

    // Start state initialization
    const startState = [nfa.startState];  // The DFA start state is created from the NFA start state
    const startStateKey = stateSetToString(startState);  // Convert NFA states to a string representing a DFA state
    
    dfaQueue.push(startStateKey);  // Add the start state to the queue
    dfaStates.set(startStateKey, startState);  // Map the DFA state string to the corresponding NFA states

    while (dfaQueue.length > 0) {
        const currentDfaState = dfaQueue.shift();  // Get the current DFA state
        const currentNfaStates = dfaStates.get(currentDfaState);  // The NFA states it represents

        // If any NFA state is an accepting state, mark this DFA state as accepting
        if (currentNfaStates.some(state => nfa.acceptStates.has(state))) {
            dfaAcceptStates.add(currentDfaState);
        }

        dfaTransitions[currentDfaState] = {};  // Initialize DFA transitions for the current DFA state

        // Process transitions for each symbol in the alphabet
        for (const symbol of nfa.alphabet) {
            const nextNfaStates = currentNfaStates.flatMap(state => nfa.transitions[state][symbol] || []);

            if (nextNfaStates.length > 0) {
                const nextDfaState = stateSetToString(nextNfaStates);  // Convert the next set of NFA states to a DFA state string
                
                if (!dfaStates.has(nextDfaState)) {
                    dfaQueue.push(nextDfaState);  // If this DFA state hasn't been processed, add it to the queue
                    dfaStates.set(nextDfaState, nextNfaStates);  // Map the DFA state string to the NFA states it represents
                }
                
                dfaTransitions[currentDfaState][symbol] = nextDfaState;  // Record the DFA transition
            }
        }
    }

    return {
        transitions: dfaTransitions,
        startState: startStateKey,
        acceptStates: [...dfaAcceptStates]
    };
}

// Helper function to convert NFA state sets to strings
function stateSetToString(stateSet) {
    return `{${stateSet.sort().join(',')}}`;
}
```

### Code Walkthrough

1. **Initialization**: 
   - We start by initializing the DFA with a queue to process states, a map to track state sets, and a structure to hold transitions and accepting states.

2. **State Processing**: 
   - We begin with the start state of the NFA, converting it into a DFA state by mapping the set of NFA states to a DFA state string (like `{q0}`). This DFA state is processed, and for each input symbol (like `'a'` or `'b'`), we calculate the new set of NFA states that can be reached.

3. **DFA State Creation**:
   - If a set of NFA states corresponds to a new DFA state (not seen before), it's added to the queue and tracked. We repeat the process until no new DFA states are left to process.

4. **Accepting States**: 
   - Any DFA state that includes an NFA accept state is marked as an accepting state.

5. **Transitions**: 
   - For each DFA state and input symbol, the appropriate DFA transitions are stored in `dfaTransitions`.

6. **Return the DFA**: 
   - Once all states are processed, we return the DFA with its transitions, start state, and accept states.

### 3. Example Execution

#### NFA:

- **States**: `['q0', 'q1', 'q2']`
- **Alphabet**: `['a', 'b']`
- **Transitions**:
  - `q0` → `a`: `{q0, q1}`, `b`: `{q0}`
  - `q1` → `a`: `{q2}`, `b`: `{}`
  - `q2` → `a`: `{}`, `b`: `{}`

#### DFA Generated:

- **States**: `['{q0}', '{q0,q1}', '{q0,q1,q2}']`
- **Start State**: `{q0}`
- **Accept States**: `{q0,q1,q2}`
- **Transitions**:
  - `{q0}` → `a`: `{q0,q1}`, `b`: `{q0}`
  - `{q0,q1}` → `a`: `{q0,q1,q2}`, `b`: `{q0}`
  - `{q0,q1,q2}` → `a`: `{q0,q1,q2}`, `b`: `{q0}`

### 4. Usage

To run the code, create an NFA object and call `convertNFAtoDFA(nfa)` to get the DFA. Example:

```javascript
const nfa = {
    states: ['q0', 'q1', 'q2'],
    alphabet: ['a', 'b'],
    transitions: {
        q0: { a: ['q0', 'q1'], b: ['q0'] },
        q1: { a: ['q2'], b: [] },
        q2: { a: [], b: [] }
    },
    startState: 'q0',
    acceptStates: new Set(['q2'])
};

const dfa = convertNFAtoDFA(nfa);
console.log(dfa);
```
