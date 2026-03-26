using FluentAssertions;
using Microsoft.GS.DPS.Model.ChatHost;

namespace Microsoft.GS.DPS.Tests.Model.ChatHost
{
    public class ChatRequestValidatorTests
    {
        private readonly ChatRequestValidator _validator;

        public ChatRequestValidatorTests()
        {
            _validator = new ChatRequestValidator();
        }

        [Fact]
        public void Validate_WithValidRequest_ShouldPass()
        {
            // Arrange
            var request = new ChatRequest
            {
                Question = "What is the document about?",
                ChatSessionId = Guid.NewGuid().ToString(),
                DocumentIds = new[] { "doc1", "doc2" }
            };

            // Act
            var result = _validator.Validate(request);

            // Assert
            result.IsValid.Should().BeTrue();
            result.Errors.Should().BeEmpty();
        }

        [Fact]
        public void Validate_WithNullQuestion_ShouldFail()
        {
            // Arrange
            var request = new ChatRequest
            {
                Question = null,
                ChatSessionId = Guid.NewGuid().ToString()
            };

            // Act
            var result = _validator.Validate(request);

            // Assert
            result.IsValid.Should().BeFalse();
            result.Errors.Should().ContainSingle()
                .Which.PropertyName.Should().Be("Question");
        }

        [Fact]
        public void Validate_WithEmptyQuestion_ShouldFail()
        {
            // Arrange
            var request = new ChatRequest
            {
                Question = string.Empty,
                ChatSessionId = Guid.NewGuid().ToString()
            };

            // Act
            var result = _validator.Validate(request);

            // Assert
            result.IsValid.Should().BeFalse();
            result.Errors.Should().ContainSingle()
                .Which.PropertyName.Should().Be("Question");
        }

        [Fact]
        public void Validate_WithWhitespaceQuestion_ShouldFail()
        {
            // Arrange
            var request = new ChatRequest
            {
                Question = "   ",
                ChatSessionId = Guid.NewGuid().ToString()
            };

            // Act
            var result = _validator.Validate(request);

            // Assert
            result.IsValid.Should().BeFalse();
            result.Errors.Should().ContainSingle()
                .Which.PropertyName.Should().Be("Question");
        }

        [Fact]
        public void Validate_WithoutChatSessionId_ShouldPass()
        {
            // Arrange
            var request = new ChatRequest
            {
                Question = "What is the document about?",
                ChatSessionId = null
            };

            // Act
            var result = _validator.Validate(request);

            // Assert
            result.IsValid.Should().BeTrue();
        }

        [Fact]
        public void Validate_WithoutDocumentIds_ShouldPass()
        {
            // Arrange
            var request = new ChatRequest
            {
                Question = "What is the document about?",
                ChatSessionId = Guid.NewGuid().ToString(),
                DocumentIds = null
            };

            // Act
            var result = _validator.Validate(request);

            // Assert
            result.IsValid.Should().BeTrue();
        }

        [Fact]
        public void Validate_WithEmptyDocumentIds_ShouldPass()
        {
            // Arrange
            var request = new ChatRequest
            {
                Question = "What is the document about?",
                ChatSessionId = Guid.NewGuid().ToString(),
                DocumentIds = Array.Empty<string>()
            };

            // Act
            var result = _validator.Validate(request);

            // Assert
            result.IsValid.Should().BeTrue();
        }
    }
}
