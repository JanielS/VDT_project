"""Safe expression evaluator for formula definitions.

Only arithmetic expressions with named dependencies are allowed. This keeps the
formula layer editable without opening the door to arbitrary code execution.
"""

import ast
import operator
from collections.abc import Callable


FormulaContext = dict[str, float]

_binary_operators: dict[type[ast.operator], Callable[[float, float], float]] = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
}

_unary_operators: dict[type[ast.unaryop], Callable[[float], float]] = {
    ast.UAdd: operator.pos,
    ast.USub: operator.neg,
}


def evaluate_expression(expression: str, context: FormulaContext) -> float:
    try:
        tree = ast.parse(expression, mode="eval")
        result = _evaluate_node(tree.body, context)
    except ZeroDivisionError:
        return 0
    except Exception as exc:
        raise ValueError(f"Formula contains unsupported syntax: {expression}") from exc

    if not isinstance(result, (int, float)):
        return 0

    if result != result or result in (float("inf"), float("-inf")):
        return 0

    return float(result)


def _evaluate_node(node: ast.AST, context: FormulaContext) -> float:
    if isinstance(node, ast.Constant):
        if isinstance(node.value, (int, float)):
            return float(node.value)
        raise ValueError("Only numeric constants are supported")

    if isinstance(node, ast.Name):
        if node.id not in context:
            raise ValueError(f"Unknown formula dependency: {node.id}")
        return float(context[node.id])

    if isinstance(node, ast.BinOp):
        operator_fn = _binary_operators.get(type(node.op))
        if operator_fn is None:
            raise ValueError("Unsupported binary operator")
        return operator_fn(_evaluate_node(node.left, context), _evaluate_node(node.right, context))

    if isinstance(node, ast.UnaryOp):
        operator_fn = _unary_operators.get(type(node.op))
        if operator_fn is None:
            raise ValueError("Unsupported unary operator")
        return operator_fn(_evaluate_node(node.operand, context))

    raise ValueError(f"Unsupported expression node: {type(node).__name__}")
