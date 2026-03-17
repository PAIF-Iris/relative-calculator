import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Display from "../../components/Display";
import ButtonGrid from "../../components/ButtonGrid";

import { relationshipEngine } from "../../engine/relationshipEngine";
import { Step, RelationshipResult } from "../../types/types";

/**
 * All buttons the engine should treat as part of the relationship chain
 */
const RELATIONS = new Set([
  "爸爸", "妈妈",
  "爷爷", "奶奶", "姥爷", "姥姥",
  "哥哥", "姐姐", "弟弟", "妹妹",
  "儿子", "女儿",
  "舅舅", "姨", "叔叔",
  "妻子", "丈夫",
  // ✅ Numbers are now part of the relation flow
  "1", "2", "3", "4", "5", "6", "7", "8", "9"
]);

export default function HomeScreen() {
  /**
   * Relation chain sent to engine (e.g., [{relation: "妈妈"}, {relation: "2"}, {relation: "姐姐"}])
   */
  const [steps, setSteps] = useState<Step[]>([]);

  /**
   * Expression shown on calculator display
   */
  const [expression, setExpression] = useState<string>("");

  /**
   * Result from engine
   */
  const [result, setResult] = useState<RelationshipResult | null>(null);

  /**
   * Whether = has been pressed
   */
  const [calculated, setCalculated] = useState<boolean>(false);

  function press(v: string) {
    /**
     * ── CLEAR ──
     */
    if (v === "C") {
      setSteps([]);
      setExpression("");
      setResult(null);
      setCalculated(false);
      return;
    }

    /**
     * ── DELETE LAST ──
     */
    if (v === "⌫") {
      if (calculated) {
        setResult(null);
        setCalculated(false);
        return;
      }

      if (steps.length > 0) {
        const newSteps = steps.slice(0, -1);
        setSteps(newSteps);
        setExpression(relationshipEngine.formatDisplay(newSteps));
      } else {
        setExpression("");
      }
      return;
    }

    /**
     * ── CALCULATE ──
     */
    if (v === "=") {
      if (steps.length === 0) return;

      const res = relationshipEngine.calculate(steps);
      setResult(res);
      setCalculated(true);
      return;
    }

    /**
     * ── RESET AFTER CALCULATION ──
     * If user presses a button after getting a result, start fresh
     */
    let currentSteps = steps;
    if (calculated) {
      currentSteps = [];
      setResult(null);
      setCalculated(false);
    }

    /**
     * ── "的" OPERATOR ──
     * We don't add "的" to steps, we just use it to help the user's eye.
     * The formatDisplay logic will handle "的" automatically based on steps.
     */
    if (v === "的") {
      if (currentSteps.length > 0 && !expression.endsWith("的")) {
        setExpression((prev) => prev + "的");
      }
      return;
    }

    /**
     * ── RELATION OR NUMBER BUTTON ──
     */
    if (RELATIONS.has(v)) {
      // Limit complexity to prevent crashes
      if (currentSteps.length >= 15) return;

      const newSteps = [...currentSteps, { relation: v }];
      setSteps(newSteps);
      
      // We let the engine determine how to display the string
      // This ensures "妈妈的2姐姐" doesn't become "妈妈的2的姐姐"
      setExpression(relationshipEngine.formatDisplay(newSteps));
      return;
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Display
        expression={expression}
        result={result}
        calculated={calculated}
      />

      <ButtonGrid onPress={press} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});