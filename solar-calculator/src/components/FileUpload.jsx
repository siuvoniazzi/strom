import React, { useCallback } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { parseCSV, mergeParsedData } from '../lib/parser';

export const FileUpload = ({ onDataLoaded }) => {
    const handleFileChange = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        try {
            const promises = files.map(file => parseCSV(file));
            const results = await Promise.all(promises);

            const mergedData = mergeParsedData(results);

            const fileName = files.length === 1
                ? files[0].name
                : `${files.length} files loaded`;

            onDataLoaded(mergedData, fileName);
        } catch (error) {
            console.error("Error parsing file:", error);
            alert("Error parsing file. Please check the format.");
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6">
            <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-gray-500">CSV files only (Multiple allowed)</p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" accept=".csv" multiple onChange={handleFileChange} />
                </label>
            </div>
        </div>
    );
};
