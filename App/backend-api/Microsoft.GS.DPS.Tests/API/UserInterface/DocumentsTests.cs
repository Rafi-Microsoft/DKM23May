using FluentAssertions;
using Microsoft.GS.DPS.API.UserInterface;
using Microsoft.GS.DPS.Model.UserInterface;
using Microsoft.GS.DPS.Storage.Document;
using Entities = Microsoft.GS.DPS.Storage.Document.Entities;
using Microsoft.KernelMemory;
using Moq;

namespace Microsoft.GS.DPS.Tests.API.UserInterface
{
    public class DocumentsTests
    {
        private readonly Mock<DocumentRepository> _mockDocumentRepository;
        private readonly Mock<MemoryWebClient> _mockMemoryWebClient;
        private readonly Mock<DataCacheManager> _mockDataCacheManager;
        private readonly Documents _documents;

        public DocumentsTests()
        {
            _mockDocumentRepository = new Mock<DocumentRepository>();
            _mockMemoryWebClient = new Mock<MemoryWebClient>();
            _mockDataCacheManager = new Mock<DataCacheManager>(MockBehavior.Loose, _mockDocumentRepository.Object);
            _documents = new Documents(
                _mockDocumentRepository.Object,
                _mockMemoryWebClient.Object,
                _mockDataCacheManager.Object
            );
        }

        [Fact]
        public async Task GetDocuments_WithValidParameters_ShouldReturnDocumentQuerySet()
        {
            // Arrange
            var pageNumber = 1;
            var pageSize = 10;
            var startDate = DateTime.UtcNow.AddDays(-30);
            var endDate = DateTime.UtcNow;

            var mockDocuments = new List<Entities.Document>
            {
                new Entities.Document { DocumentId = "doc1", FileName = "test1.pdf" },
                new Entities.Document { DocumentId = "doc2", FileName = "test2.pdf" }
            };

            var queryResultSet = new QueryResultSet
            {
                Results = mockDocuments,
                TotalRecords = 2,
                CurrentPage = pageNumber,
                TotalPages = 1
            };

            var mockKeywords = new Dictionary<string, List<string>>
            {
                { "Category1", new List<string> { "keyword1", "keyword2" } }
            };

            _mockDocumentRepository
                .Setup(x => x.GetAllDocumentsByPageAsync(pageNumber, pageSize, startDate, endDate))
                .ReturnsAsync(queryResultSet);

            _mockDataCacheManager
                .Setup(x => x.GetConsolidatedKeywordsAsync())
                .ReturnsAsync(mockKeywords);

            // Act
            var result = await _documents.GetDocuments(pageNumber, pageSize, startDate, endDate);

            // Assert
            result.Should().NotBeNull();
            result.documents.Should().HaveCount(2);
            result.TotalRecords.Should().Be(2);
            result.CurrentPage.Should().Be(pageNumber);
            result.keywordFilterInfo.Should().NotBeNull();
            result.keywordFilterInfo.Should().ContainKey("Category1");

            _mockDocumentRepository.Verify(
                x => x.GetAllDocumentsByPageAsync(pageNumber, pageSize, startDate, endDate),
                Times.Once
            );
            _mockDataCacheManager.Verify(x => x.GetConsolidatedKeywordsAsync(), Times.Once);
        }

        [Fact]
        public async Task GetDocuments_WithNullDates_ShouldCallRepositoryWithNullDates()
        {
            // Arrange
            var pageNumber = 1;
            var pageSize = 10;

            var queryResultSet = new QueryResultSet
            {
                Results = new List<Entities.Document>(),
                TotalRecords = 0,
                CurrentPage = pageNumber,
                TotalPages = 0
            };

            _mockDocumentRepository
                .Setup(x => x.GetAllDocumentsByPageAsync(pageNumber, pageSize, null, null))
                .ReturnsAsync(queryResultSet);

            _mockDataCacheManager
                .Setup(x => x.GetConsolidatedKeywordsAsync())
                .ReturnsAsync(new Dictionary<string, List<string>>());

            // Act
            var result = await _documents.GetDocuments(pageNumber, pageSize, null, null);

            // Assert
            result.Should().NotBeNull();
            result.documents.Should().BeEmpty();
            _mockDocumentRepository.Verify(
                x => x.GetAllDocumentsByPageAsync(pageNumber, pageSize, null, null),
                Times.Once
            );
        }

        [Fact]
        public async Task GetDocument_WithValidDocumentId_ShouldReturnDocument()
        {
            // Arrange
            var documentId = "test-doc-123";
            var expectedDocument = new Entities.Document
            {
                DocumentId = documentId,
                FileName = "test.pdf",
                ImportedTime = DateTime.UtcNow
            };

            _mockDocumentRepository
                .Setup(x => x.FindByDocumentIdAsync(documentId))
                .ReturnsAsync(expectedDocument);

            // Act
            var result = await _documents.GetDocument(documentId);

            // Assert
            result.Should().NotBeNull();
            result.DocumentId.Should().Be(documentId);
            result.FileName.Should().Be("test.pdf");
            _mockDocumentRepository.Verify(x => x.FindByDocumentIdAsync(documentId), Times.Once);
        }

        [Fact]
        public async Task GetDocument_WithNonExistentId_ShouldReturnNull()
        {
            // Arrange
            var documentId = "non-existent-id";

            _mockDocumentRepository
                .Setup(x => x.FindByDocumentIdAsync(documentId))
                .ReturnsAsync((Entities.Document)null);

            // Act
            var result = await _documents.GetDocument(documentId);

            // Assert
            result.Should().BeNull();
            _mockDocumentRepository.Verify(x => x.FindByDocumentIdAsync(documentId), Times.Once);
        }

        [Theory]
        [InlineData(1, 5)]
        [InlineData(2, 10)]
        [InlineData(5, 20)]
        public async Task GetDocuments_WithDifferentPageSizes_ShouldUseCorrectParameters(
            int pageNumber, 
            int pageSize)
        {
            // Arrange
            var queryResultSet = new QueryResultSet
            {
                Results = new List<Entities.Document>(),
                TotalRecords = 0,
                CurrentPage = pageNumber,
                TotalPages = 0
            };

            _mockDocumentRepository
                .Setup(x => x.GetAllDocumentsByPageAsync(pageNumber, pageSize, null, null))
                .ReturnsAsync(queryResultSet);

            _mockDataCacheManager
                .Setup(x => x.GetConsolidatedKeywordsAsync())
                .ReturnsAsync(new Dictionary<string, List<string>>());

            // Act
            var result = await _documents.GetDocuments(pageNumber, pageSize, null, null);

            // Assert
            result.Should().NotBeNull();
            result.CurrentPage.Should().Be(pageNumber);
            _mockDocumentRepository.Verify(
                x => x.GetAllDocumentsByPageAsync(pageNumber, pageSize, null, null),
                Times.Once
            );
        }
    }
}
