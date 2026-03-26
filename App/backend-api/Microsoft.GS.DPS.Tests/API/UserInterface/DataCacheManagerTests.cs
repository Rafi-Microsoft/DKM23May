using FluentAssertions;
using Microsoft.GS.DPS.API.UserInterface;
using Microsoft.GS.DPS.Storage.Document;
using Entities = Microsoft.GS.DPS.Storage.Document.Entities;
using Moq;

namespace Microsoft.GS.DPS.Tests.API.UserInterface
{
    public class DataCacheManagerTests
    {
        private readonly Mock<DocumentRepository> _mockDocumentRepository;
        private readonly DataCacheManager _cacheManager;

        public DataCacheManagerTests()
        {
            _mockDocumentRepository = new Mock<DocumentRepository>();
            _cacheManager = new DataCacheManager(_mockDocumentRepository.Object);
        }

        [Fact]
        public async Task GetConsolidatedKeywordsAsync_WhenCacheIsEmpty_ShouldLoadFromRepository()
        {
            // Arrange
            var expectedKeywords = new Dictionary<string, List<string>>
            {
                { "Category1", new List<string> { "keyword1", "keyword2" } },
                { "Category2", new List<string> { "keyword3" } }
            };

            _mockDocumentRepository
                .Setup(x => x.GetAllDocuments())
                .ReturnsAsync(new List<Entities.Document>
                {
                    new Entities.Document
                    {
                        Keywords = new Dictionary<string, string>
                        {
                            { "Category1", "keyword1, keyword2" }
                        }
                    },
                    new Entities.Document
                    {
                        Keywords = new Dictionary<string, string>
                        {
                            { "Category2", "keyword3" }
                        }
                    }
                });

            // Act
            var result = await _cacheManager.GetConsolidatedKeywordsAsync();

            // Assert
            result.Should().NotBeNull();
            _mockDocumentRepository.Verify(x => x.GetAllDocuments(), Times.Once);
        }

        [Fact]
        public async Task GetConsolidatedKeywordsAsync_WhenCalledMultipleTimes_ShouldUseCachedData()
        {
            // Arrange
            _mockDocumentRepository
                .Setup(x => x.GetAllDocuments())
                .ReturnsAsync(new List<Entities.Document>
                {
                    new Entities.Document
                    {
                        Keywords = new Dictionary<string, string>
                        {
                            { "Category1", "keyword1" }
                        }
                    }
                });

            // Act
            var result1 = await _cacheManager.GetConsolidatedKeywordsAsync();
            var result2 = await _cacheManager.GetConsolidatedKeywordsAsync();
            var result3 = await _cacheManager.GetConsolidatedKeywordsAsync();

            // Assert
            result1.Should().NotBeNull();
            result2.Should().NotBeNull();
            result3.Should().NotBeNull();
            _mockDocumentRepository.Verify(x => x.GetAllDocuments(), Times.Once, 
                "Repository should only be called once, subsequent calls should use cache");
        }

        [Fact]
        public async Task ManualRefresh_ShouldRefreshCachedData()
        {
            // Arrange
            _mockDocumentRepository
                .Setup(x => x.GetAllDocuments())
                .ReturnsAsync(new List<Entities.Document>
                {
                    new Entities.Document
                    {
                        Keywords = new Dictionary<string, string>
                        {
                            { "Category1", "keyword1" }
                        }
                    }
                });

            await _cacheManager.GetConsolidatedKeywordsAsync();

            // Act
            _cacheManager.ManualRefresh();
            await Task.Delay(100); // Give time for refresh
            await _cacheManager.GetConsolidatedKeywordsAsync();

            // Assert
            _mockDocumentRepository.Verify(x => x.GetAllDocuments(), Times.AtLeast(2),
                "Repository should be called at least twice after manual refresh");
        }

        [Fact]
        public async Task GetConsolidatedKeywordsAsync_WithEmptyDocuments_ShouldReturnEmptyDictionary()
        {
            // Arrange
            _mockDocumentRepository
                .Setup(x => x.GetAllDocuments())
                .ReturnsAsync(new List<Entities.Document>());

            // Act
            var result = await _cacheManager.GetConsolidatedKeywordsAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        [Fact]
        public async Task GetConsolidatedKeywordsAsync_WithDocumentsHavingNoKeywords_ShouldReturnEmptyDictionary()
        {
            // Arrange
            _mockDocumentRepository
                .Setup(x => x.GetAllDocuments())
                .ReturnsAsync(new List<Entities.Document>
                {
                    new Entities.Document { Keywords = null },
                    new Entities.Document { Keywords = new Dictionary<string, string>() }
                });

            // Act
            var result = await _cacheManager.GetConsolidatedKeywordsAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        [Fact]
        public async Task GetConsolidatedKeywordsAsync_ShouldConsolidateDuplicateKeywords()
        {
            // Arrange
            _mockDocumentRepository
                .Setup(x => x.GetAllDocuments())
                .ReturnsAsync(new List<Entities.Document>
                {
                    new Entities.Document
                    {
                        Keywords = new Dictionary<string, string>
                        {
                            { "Category1", "keyword1, keyword2" }
                        }
                    },
                    new Entities.Document
                    {
                        Keywords = new Dictionary<string, string>
                        {
                            { "Category1", "keyword2, keyword3" }
                        }
                    }
                });

            // Act
            var result = await _cacheManager.GetConsolidatedKeywordsAsync();

            // Assert
            result.Should().ContainKey("Category1");
            result["Category1"].Should().Contain("keyword1");
            result["Category1"].Should().Contain("keyword2");
            result["Category1"].Should().Contain("keyword3");
            result["Category1"].Should().OnlyHaveUniqueItems();
        }
    }
}
