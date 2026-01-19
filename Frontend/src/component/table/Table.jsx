import React, { useState, useEffect } from "react";

function Table({
  columns = [],
  data = [],
  tableClass = "",
  pageSize = 5,
  footerClass = "",
  footerTextClass = "",
  paginationClass = "",
}) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const startItem = (currentPage - 1) * pageSize;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const paginatedData = data.slice(startItem, endItem);

  return (
    <div className={`rounded-lg bg-[#0F2A52] w-full ${tableClass}`}>
      {/* Scrollable table wrapper */}
      <div className="overflow-x-auto overflow-y-visible">
        <table className="w-full border-collapse" style={{ minWidth: '800px' }}>
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className="px-4 py-3 bg-[#0A1A3A] text-[#9BB3D6] font-semibold text-left text-sm whitespace-nowrap"
                  style={{ minWidth: col.minWidth || '150px' }}
                >
                  {col.label || col.key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`${
                  rowIndex % 2 === 0 ? "bg-[#0C1F44]" : ""
                } hover:bg-[#1A2B5D] text-white`}
              >
                {columns.map((col, colIndex) => (
                  <td 
                    key={colIndex} 
                    className="px-4 py-3 text-sm whitespace-nowrap"
                    style={{ minWidth: col.minWidth || '150px' }}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className={`flex justify-between items-center px-4 py-3 bg-[#0A1A3A]/30 rounded-b-lg ${footerClass}`}>
        <span className={`text-[#9BB3D6] text-sm ${footerTextClass}`}>
          Showing {startItem + 1}-{endItem} of {totalItems}
        </span>
        <div className={`flex gap-2 ${paginationClass}`}>
          <button
            className="px-3 py-1 bg-[#2EA8FF] text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2596e6] transition-colors"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          <button
            className="px-3 py-1 bg-[#2EA8FF] text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2596e6] transition-colors"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}

export default Table;