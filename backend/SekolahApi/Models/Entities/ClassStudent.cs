namespace SekolahApi.Models.Entities
{
    /// <summary>
    /// Junction table linking students to classes.
    /// </summary>
    public class ClassStudent : BaseEntity
    {
        public int ClassId { get; set; }
        public int StudentId { get; set; }

        // Navigation properties
        public Class Class { get; set; } = null!;
        public Student Student { get; set; } = null!;
    }
}
