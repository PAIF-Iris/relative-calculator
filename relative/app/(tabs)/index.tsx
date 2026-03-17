import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Display from "../../components/Display";
import ButtonGrid from "../../components/ButtonGrid";

import { relationshipEngine } from "../../engine/relationshipEngine";
import { Step, RelationshipResult } from "../../types/types";

/**
 * All relation buttons the engine understands
 */
const RELATIONS = new Set([
  "爸爸","妈妈",

  "爷爷","奶奶","姥爷","姥姥",

  "哥哥","姐姐","弟弟","妹妹",

  "儿子","女儿",

  "舅舅","姨","叔叔",

  // spouse relations
  "妻子","丈夫"
]);

export default function HomeScreen() {

  /**
   * Relation chain sent to engine
   */
  const [steps, setSteps] = useState<Step[]>([]);

  /**
   * Number pressed before a relation
   * example: 2姐姐
   */
  const [pendingSeniority, setPendingSeniority] = useState<number>(0);

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
     * CLEAR
     */
    if (v === "C") {
      setSteps([]);
      setPendingSeniority(0);
      setExpression("");
      setResult(null);
      setCalculated(false);
      return;
    }

    /**
     * DELETE LAST
     */
    if (v === "⌫") {

      if (calculated) {
        setResult(null);
        setCalculated(false);
        return;
      }

      if (pendingSeniority > 0) {
        setPendingSeniority(0);
        setExpression(prev =>
          prev.replace(/的?\d$/, "").replace(/^\d$/, "")
        );
        return;
      }

      if (steps.length > 0) {
        const newSteps = steps.slice(0, -1);
        setSteps(newSteps);
        setExpression(relationshipEngine.formatDisplay(newSteps));
      }

      return;
    }

    /**
     * CALCULATE
     */
    if (v === "=") {

      if (steps.length === 0) return;

      const res = relationshipEngine.calculate(steps);

      setResult(res);
      setCalculated(true);

      return;
    }

    /**
     * After = pressed, next input resets
     */
    if (calculated) {
      setSteps([]);
      setPendingSeniority(0);
      setExpression("");
      setResult(null);
      setCalculated(false);
    }

    /**
     * NUMBER → seniority
     */
    if (/^[1-9]$/.test(v)) {

      const n = Number(v);

      setPendingSeniority(n);

      setExpression(prev =>
        prev
          ? prev.endsWith("的")
            ? prev + v
            : prev + "的" + v
          : v
      );

      return;
    }

    /**
     * 的 (visual only)
     */
    if (v === "的") {

      if (steps.length > 0 && !expression.endsWith("的")) {
        setExpression(prev => prev + "的");
      }

      return;
    }

    /**
     * RELATION BUTTON
     */
    if (RELATIONS.has(v)) {

      if (steps.length >= 3) return;

      const newStep: Step = {
        relation: v,
        seniority: pendingSeniority
      };

      const newSteps = [...steps, newStep];

      setSteps(newSteps);

      setPendingSeniority(0);

      setExpression(
        relationshipEngine.formatDisplay(newSteps)
      );

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
    backgroundColor: "#000"
  }

});