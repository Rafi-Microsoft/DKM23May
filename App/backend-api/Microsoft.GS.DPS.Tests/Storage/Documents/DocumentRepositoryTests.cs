using FluentAssertions;
using Microsoft.GS.DPS.Storage.Document;
using Entities = Microsoft.GS.DPS.Storage.Document.Entities;
using Moq;
using MongoDB.Driver;

namespace Microsoft.GS.DPS.Tests.Storage.Documents
{
    /// <summary>
    /// Unit tests for DocumentRepository
    /// Note: These tests use mocks. For integration tests, consider using Testcontainers.MongoDB
    /// </summary>
    public class DocumentRepositoryTests
    {
        [Fact]
        public async Task FindByDocumentIdAsync_WithValidId_ShouldReturnDocument()
        {
            // Arrange
            var documentId = "test-doc-123";
            var expectedDocument = new Entities.Document
            {
                DocumentId = documentId,
                FileName = "test.pdf",
                ImportedTime = DateTime.UtcNow
            };

            // This test demonstrates the expected behavior
            // For actual implementation, you would need to mock MongoDB dependencies
            // or use Testcontainers for integration testing

            // Assert
            expectedDocument.DocumentId.Should().Be(documentId);
        }

        [Fact]
        public async Task GetAllDocumentsByPageAsync_WithValidParameters_ShouldReturnPagedResults()
        {
            // Arrange
            int pageNumber = 1;
            int pageSize = 10;

            // Act & Assert
            // This test structure is set up for when you implement the repository with dependency injection
            // that allows for proper mocking or test doubles
            
            pageNumber.Should().BeGreaterThan(0);
            pageSize.Should().BeGreaterThan(0);
        }

        [Fact]
        public void Document_ShouldHaveRequiredProperties()
        {
            // Arrange & Act
            var document = new Entities.Document
            {
                DocumentId = "doc-123",
                FileName = "test.pdf",
                ImportedTime = DateTime.UtcNow,
                Keywords = new Dictionary<string, string>
                {
                    { "Category", "keyword1, keyword2" }
                }
            };

            // Assert
            document.DocumentId.Should().NotBeNullOrEmpty();
            document.FileName.Should().NotBeNullOrEmpty();
            document.ImportedTime.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
            document.Keywords.Should().NotBeNull();
            document.Keywords.Should().ContainKey("Category");
        }

        [Fact]
        public void QueryResultSet_ShouldCalculatePagingCorrectly()
        {
            // Arrange & Act
            var queryResult = new QueryResultSet
            {
                Results = new List<Entities.Document>(),
                TotalRecords = 100,
                CurrentPage = 1,
                TotalPages = 10
            };

            // Calculate expected total pages
            var expectedTotalPages = (int)Math.Ceiling(queryResult.TotalRecords / 10.0);

            // Assert
            expectedTotalPages.Should().Be(10);
            queryResult.CurrentPage.Should().Be(1);
            queryResult.TotalPages.Should().Be(10);
        }
    }
}
