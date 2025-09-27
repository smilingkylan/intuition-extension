# 🤖 AI Collaboration Guide
*How to help me create accurate, high-quality code and architecture decisions*

---

## 🎯 Requirements & Context

### 1. **Be Specific About Intent**

> **✅ Good**: "I want a wallet provider in the sidepanel that uses persisted state from background but executes transactions directly"
> 
> **❌ Bad**: "Make the wallet work better"

**Why**: Specific requirements help me understand the exact problem you're solving, not just symptoms.

### 2. **Explain the "Why" Behind Decisions**

**Example**: When you said *"I want transactions sent directly, not through background"* - this helped me understand performance and UX were priorities over architectural purity.

### 3. **Share Constraints & Trade-offs**

- 📦 Performance requirements (bundle size, speed)
- 👥 User experience priorities  
- 🔧 Technical constraints (extension vs web app)
- 🔗 Integration requirements with existing systems

---

## 🏗️ Architecture Communication

### 4. **Show Me the Current State First**

✅ **What worked well**: You let me explore the existing codebase before asking for changes. This prevented me from suggesting solutions that don't fit the current architecture.

### 5. **Point Out Patterns You Like/Dislike**

```typescript
// Example of helpful guidance
"I like how x-turbo-plasmo handles this, but don't want the 
complexity of revel8-explorer's approach"
```

### 6. **Be Clear About Scope**

When you said **"ONLY the Generate & Create Random Atom button"** - this prevented me from over-engineering a full wallet management system.

---

## 🔧 Code Quality Hints

### 7. **Share Your Coding Standards**

- 📝 TypeScript strictness level
- ⚠️ Preferred error handling patterns
- 🧩 Component composition preferences
- 📊 State management philosophy

### 8. **Highlight Integration Points**

Point out existing hooks, services, or patterns I should use:

```typescript
// Examples of helpful direction
"Use the existing useWeb3 hook for connection state"
"Follow the pattern from TransactionProvider"
```

### 9. **Show Me Examples of "Good" vs "Bad"**

✅ **What you did well**: Showing me the difference between the old `sendToBackground` pattern and the desired direct execution pattern.

---

## 🧪 Testing & Validation

### 10. **Share Your Testing Approach**

- 🔍 How you verify functionality works
- 🤖 Whether you prefer manual testing or automated  
- 🌍 What environments you test in

### 11. **Point Out Edge Cases Early**

Ask questions like:
- *"What happens when wallet disconnects mid-transaction?"*
- *"How should this behave on mobile?"*
- *"What if MetaMask isn't installed?"*

---

## 🔄 Iteration & Feedback

### 12. **Correct Me Early & Specifically**

> 🎯 **Perfect example**: *"Why is this transaction being sent to the background, did we not agree to set up an ad-hoc provider?"*

This immediate, specific correction saved us from continuing down the wrong path.

### 13. **Share Related Projects/References**

Mentioning the `sidepanel-web3-demo` project helped me understand you already had a working example to reference.

---

## 📚 Knowledge Sharing

### 14. **Explain Domain-Specific Terms**

- 🧬 "Atoms" and "Triples" in Intuition context
- 💼 Business logic vs technical implementation
- 👤 User workflow expectations

### 15. **Share Performance Requirements**

- 📏 Extension size constraints
- ⚡ Transaction speed expectations
- 🧠 Memory usage considerations

---

## 🎨 UI/UX Guidance

### 16. **Describe User Experience Goals**

> - *"Users should see MetaMask popup immediately"*
> - *"Don't make users reconnect every time"*
> - *"Keep it simple for non-technical users"*

---

## 📂 Project Context

### 17. **Explain Project Relationships**

You have multiple related projects (`intuition-extension`, `revel8-explorer`, `x-turbo-plasmo`). 

**Clarifying which patterns to follow from which project is crucial.**

### 18. **Share Migration Strategy**

- 🔄 What you want to keep vs replace
- ⏰ Timeline for changes
- 🔙 Backward compatibility needs

---

## 💡 Pro Tips for Our Collaboration

### 19. **Use "Show, Don't Tell"**

| Approach | Example |
|----------|---------|
| **🏆 Great** | Showing me the specific code that's wrong |
| **👍 Good** | "That approach won't work" |

### 20. **Progressive Disclosure**

Start with the core problem, then add complexity:

```
1. "I want direct transactions"
2. "Using background state"  
3. "With this specific button"
4. "Following this pattern"
```

### 21. **Validate Assumptions**

Ask questions like:
- *"Should this handle multiple wallets?"*
- *"Do we need to support wallet switching?"*
- *"Is this temporary or production code?"*

---

## 🚫 What to Avoid

| ❌ Don't Do | ✅ Do Instead |
|-------------|---------------|
| Vague requirements: *"Make it better"* | Specific goals: *"Reduce transaction time"* |
| Missing context: Not mentioning existing patterns | Reference current implementations |
| Changing scope mid-implementation | Define clear boundaries upfront |
| Assuming I know your priorities | Explicitly state: Security vs Speed vs Simplicity |

---

## 🏆 What You Did Exceptionally Well

- ✅ **Clear correction** when I went off-track
- ✅ **Specific scope** ("ONLY this button")  
- ✅ **Architectural clarity** (hybrid approach explanation)
- ✅ **Letting me explore** the codebase first
- ✅ **Concrete examples** of what you wanted

---

## 🎯 Bottom Line

> **This type of clear, iterative communication helps me create code that actually solves your problem instead of what I think your problem might be!**

*The more context and specificity you provide, the more accurate and useful my suggestions will be.*