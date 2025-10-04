import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export default function TableEditor({ rows = [[""]], onChange }) {
  const [tableData, setTableData] = useState(rows);

  const updateCell = (rowIndex, colIndex, value) => {
    const newData = tableData.map((row, i) =>
      i === rowIndex
        ? row.map((cell, j) => (j === colIndex ? value : cell))
        : row
    );
    setTableData(newData);
    onChange(newData);
  };

  const addRow = () => {
    const colCount = tableData[0]?.length || 1;
    const newRow = Array(colCount).fill("");
    const newData = [...tableData, newRow];
    setTableData(newData);
    onChange(newData);
  };

  const deleteRow = (rowIndex) => {
    if (tableData.length <= 1) return;
    const newData = tableData.filter((_, i) => i !== rowIndex);
    setTableData(newData);
    onChange(newData);
  };

  const addColumn = () => {
    const newData = tableData.map((row) => [...row, ""]);
    setTableData(newData);
    onChange(newData);
  };

  const deleteColumn = (colIndex) => {
    if (tableData[0]?.length <= 1) return;
    const newData = tableData.map((row) =>
      row.filter((_, i) => i !== colIndex)
    );
    setTableData(newData);
    onChange(newData);
  };

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <button
          onClick={addRow}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Row
        </button>
        <button
          onClick={addColumn}
          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          Add Column
        </button>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full border-collapse">
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <td key={colIndex} className="border p-0 relative">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) =>
                        updateCell(rowIndex, colIndex, e.target.value)
                      }
                      className="w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`R${rowIndex + 1}C${colIndex + 1}`}
                    />
                    {colIndex === row.length - 1 && rowIndex === 0 && (
                      <button
                        onClick={() => deleteColumn(colIndex)}
                        className="absolute -right-2 -top-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        title="Delete column"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </td>
                ))}
                <td className="border-0 pl-2">
                  <button
                    onClick={() => deleteRow(rowIndex)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                    title="Delete row"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
