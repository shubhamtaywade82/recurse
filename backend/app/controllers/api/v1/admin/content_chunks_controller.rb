class Api::V1::Admin::ContentChunksController < Api::V1::Admin::BaseController

  def index
    chunks = ContentChunk.all.order(created_at: :desc)
    render json: { content_chunks: chunks }
  end

  def create
    chunk = ContentChunk.new(chunk_params)
    chunk.embedding_json = { simulated: true }
    if chunk.save
      render json: { content_chunk: chunk }
    else
      render json: { errors: chunk.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    chunk = ContentChunk.find(params[:id])
    if chunk.update(chunk_params)
      render json: { content_chunk: chunk }
    else
      render json: { errors: chunk.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    chunk = ContentChunk.find(params[:id])
    chunk.destroy!
    render json: { message: "Content chunk deleted successfully" }
  end

  private

  def chunk_params
    params.require(:content_chunk).permit(:source_type, :title, :content)
  end
end
