using System;

namespace SekolahApi.Data
{
    public class ReferentialConstraintException : Exception
    {
        public string TargetTable { get; }
        public string ConflictChildTable { get; }

        public ReferentialConstraintException(string message, string targetTable = "", string conflictChildTable = "") 
            : base(message)
        {
            TargetTable = targetTable;
            ConflictChildTable = conflictChildTable;
        }
    }
}

