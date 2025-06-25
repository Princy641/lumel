"use client"

import { useState, useCallback } from "react"
import "./hierarchical-table.css";

const initialData = [
    {
        id: "electronics",
        label: "Electronics",
        value: 1500,
        originalValue: 1500,
        level: 0,
        children: [
            {
                id: "phones",
                label: "Phones",
                value: 800,
                originalValue: 800,
                level: 1,
                children: [],
            },
            {
                id: "laptops",
                label: "Laptops",
                value: 700,
                originalValue: 700,
                level: 1,
                children: [],
            },
        ],
    },
    {
        id: "furniture",
        label: "Furniture",
        value: 1000,
        originalValue: 1000,
        level: 0,
        children: [
            {
                id: "tables",
                label: "Tables",
                value: 300,
                originalValue: 300,
                level: 1,
                children: [],
            },
            {
                id: "chairs",
                label: "Chairs",
                value: 700,
                originalValue: 700,
                level: 1,
                children: [],
            },
        ],
    },
]

export default function HierarchicalTable() {
    const [data, setData] = useState(initialData)
    const [inputValues, setInputValues] = useState({})

    const calculateSubtotal = (children) => {
        return children.reduce((sum, child) => sum + child.value, 0)
    }

    const updateRowValue = useCallback((rowId, newValue, isPercentage = false) => {
        setData((prevData) => {
            const updateRow = (rows) => {
                return rows.map((row) => {
                    if (row.id === rowId) {
                        const updatedValue = isPercentage ? row.originalValue * (1 + newValue / 100) : newValue
                        return {
                            ...row,
                            value: Math.round(updatedValue * 100) / 100,
                        }
                    }

                    if (row.children && row.children.length > 0) {
                        const updatedChildren = updateRow(row.children)
                        const hasUpdatedChild = updatedChildren.some((child, index) => child !== row.children[index])

                        if (hasUpdatedChild) {
                            const newSubtotal = calculateSubtotal(updatedChildren)
                            return {
                                ...row,
                                children: updatedChildren,
                                value: newSubtotal,
                            }
                        }

                        return {
                            ...row,
                            children: updatedChildren,
                        }
                    }

                    return row
                })
            }

            return updateRow(prevData)
        })
    }, [])

    const handleInputChange = (rowId, value) => {
        setInputValues((prev) => ({
            ...prev,
            [rowId]: value,
        }))
    }

    const handleAllocationPercentage = (rowId) => {
        const inputValue = inputValues[rowId]
        if (inputValue && !isNaN(Number(inputValue))) {
            updateRowValue(rowId, Number(inputValue), true)
            clearInput(rowId)
        }
    }

    const handleAllocationValue = (rowId) => {
        const inputValue = inputValues[rowId]
        if (inputValue && !isNaN(Number(inputValue))) {
            updateRowValue(rowId, Number(inputValue), false)
            clearInput(rowId)
        }
    }

    const clearInput = (rowId) => {
        setInputValues((prev) => ({
            ...prev,
            [rowId]: "",
        }))
    }

    const calculateVariance = (currentValue, originalValue) => {
        if (originalValue === 0) return "0%"
        const variance = ((currentValue - originalValue) / originalValue) * 100
        return `${Math.round(variance * 100) / 100}%`
    }

    const getVarianceClass = (currentValue, originalValue) => {
        if (currentValue > originalValue) return "variance-positive"
        if (currentValue < originalValue) return "variance-negative"
        return "variance-neutral"
    }

    const flattenRows = (rows) => {
        const result = []
        const traverse = (items) => {
            items.forEach((item) => {
                result.push(item)
                if (item.children && item.children.length > 0) {
                    traverse(item.children)
                }
            })
        }
        traverse(rows)
        return result
    }

    const allRows = flattenRows(data)
    const grandTotal = data.reduce((sum, row) => sum + row.value, 0)
    const originalGrandTotal = initialData.reduce((sum, row) => sum + row.originalValue, 0)

    return (
        <div className="container">
            <div className="card">
                <div className="card-header">
                    <h1 className="card-title">Hierarchical Sales Data Table</h1>
                </div>
                <div className="card-content">
                    <div className="table-container">
                        <table className="table">
                            <thead className="table-header">
                                <tr>
                                    <th className="text-left">Label</th>
                                    <th className="text-right">Value</th>
                                    <th className="text-center">Input</th>
                                    <th className="text-center">Allocation %</th>
                                    <th className="text-center">Allocation Val</th>
                                    <th className="text-right">Variance %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allRows.map((row) => (
                                    <tr key={row.id} className="table-row">
                                        <td className={`table-cell label-cell level-${row.level}`}>
                                            {row.level > 0 && "-- "}
                                            {row.label}
                                        </td>
                                        <td className="table-cell text-right value-cell">{Math.round(row.value)}</td>
                                        <td className="table-cell text-center">
                                            <input
                                                type="number"
                                                value={inputValues[row.id] || ""}
                                                onChange={(e) => handleInputChange(row.id, e.target.value)}
                                                className="input-field"
                                                placeholder="0"
                                            />
                                        </td>
                                        <td className="table-cell text-center">
                                            <button onClick={() => handleAllocationPercentage(row.id)} className="btn btn-percentage">
                                                %
                                            </button>
                                        </td>
                                        <td className="table-cell text-center">
                                            <button onClick={() => handleAllocationValue(row.id)} className="btn btn-value">
                                                Val
                                            </button>
                                        </td>
                                        <td
                                            className={`table-cell text-right variance-cell ${getVarianceClass(row.value, row.originalValue)}`}
                                        >
                                            {calculateVariance(row.value, row.originalValue)}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="table-row grand-total-row">
                                    <td className="table-cell">Grand Total</td>
                                    <td className="table-cell text-right value-cell">{Math.round(grandTotal)}</td>
                                    <td className="table-cell text-center">-</td>
                                    <td className="table-cell text-center">-</td>
                                    <td className="table-cell text-center">-</td>
                                    <td
                                        className={`table-cell text-right variance-cell ${getVarianceClass(grandTotal, originalGrandTotal)}`}
                                    >
                                        {calculateVariance(grandTotal, originalGrandTotal)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

