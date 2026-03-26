using FluentAssertions;
using Microsoft.GS.DPS.Model.UserInterface;

namespace Microsoft.GS.DPS.Tests.Model.UserInterface
{
    public class PagingRequestValidatorTests
    {
        private readonly PagingRequestValidator _validator;

        public PagingRequestValidatorTests()
        {
            _validator = new PagingRequestValidator();
        }

        [Fact]
        public void Validate_WithValidRequest_ShouldPass()
        {
            // Arrange
            var request = new PagingRequest
            {
                PageNumber = 1,
                PageSize = 10
            };

            // Act
            var result = _validator.Validate(request);

            // Assert
            result.IsValid.Should().BeTrue();
            result.Errors.Should().BeEmpty();
        }

        [Theory]
        [InlineData(0)]
        [InlineData(-1)]
        [InlineData(-100)]
        public void Validate_WithInvalidPageNumber_ShouldFail(int pageNumber)
        {
            // Arrange
            var request = new PagingRequest
            {
                PageNumber = pageNumber,
                PageSize = 10
            };

            // Act
            var result = _validator.Validate(request);

            // Assert
            result.IsValid.Should().BeFalse();
            result.Errors.Should().ContainSingle()
                .Which.PropertyName.Should().Be("PageNumber");
        }

        [Theory]
        [InlineData(0)]
        [InlineData(-1)]
        [InlineData(-50)]
        public void Validate_WithInvalidPageSize_ShouldFail(int pageSize)
        {
            // Arrange
            var request = new PagingRequest
            {
                PageNumber = 1,
                PageSize = pageSize
            };

            // Act
            var result = _validator.Validate(request);

            // Assert
            result.IsValid.Should().BeFalse();
            result.Errors.Should().ContainSingle()
                .Which.PropertyName.Should().Be("PageSize");
        }

        [Theory]
        [InlineData(1, 1)]
        [InlineData(1, 50)]
        [InlineData(10, 20)]
        [InlineData(100, 100)]
        public void Validate_WithVariousValidCombinations_ShouldPass(int pageNumber, int pageSize)
        {
            // Arrange
            var request = new PagingRequest
            {
                PageNumber = pageNumber,
                PageSize = pageSize
            };

            // Act
            var result = _validator.Validate(request);

            // Assert
            result.IsValid.Should().BeTrue();
        }
    }
}
